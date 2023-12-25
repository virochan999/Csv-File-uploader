document.addEventListener('DOMContentLoaded', () => {
  let currentPage = 1
  let currentFileId
  const recordsPerPage = 10
  let searchTerm = ''
  const uploadForm = document.getElementById('uploadForm')
  const fileListContainer = document.getElementById('fileList')
  const nextPageButton = document.getElementById('nextPageButton')
  const prevPageButton = document.getElementById('prevPageButton')
  const paginationData = document.querySelector('.pagination-data')
  const paginationWrapper = document.querySelector('.pagination-wrapper')

  const fetchFileList = async () => {
    try {
      const response = await fetch('http://localhost:5000/upload/list')
      const fileList = await response.json()

      fileListContainer.innerHTML = '' 

      // Populate the file list container with links or buttons to select files
      fileList.forEach((file) => {
        const wrapper = document.createElement('div')
        const fileLink = document.createElement('a')
        const deletebtn = document.createElement('button')
        wrapper.classList.add('p-2', 'bg-blue-800', 'text-white', 'rounded-sm', 'shadow-[rgba(0,0,0,0.24)_0px_3px_8px]', 'flex', 'justify-between')
        fileLink.href = '#'
        fileLink.textContent = file.name
        fileLink.addEventListener('click', () => {
          currentFileId = file._id
          searchInput.value = ''
          searchTerm = ''
          updateUrl()
        })
        deletebtn.innerHTML = 'Delete'
        deletebtn.classList.add('text-red-500')
        deletebtn.addEventListener('click', () => {
          deleteCsvFile(file._id)
        })
        wrapper.appendChild(fileLink)
        wrapper.appendChild(deletebtn)

        fileListContainer.appendChild(wrapper)
      })
    } catch (error) {
      console.error(error)
    }
  }

  fetchFileList()

  uploadForm.addEventListener('submit', async(event) => {
    event.preventDefault()

    const fileInput = document.getElementById('file_input')
    const file = fileInput.files[0]

    if(file) {
      const allowedExtentions = ['csv']
      const fileExtension = file.name.slice(((file.name.lastIndexOf('.')-1) >>> 0) + 2)
      if (!allowedExtentions.includes(fileExtension.toLowerCase())) {
        Toastify({
          text: "Invalid file type. Only CSV files are allowed",
          close: true,
          style: {
            background: "linear-gradient(to right, #ff3333, #D8000C)",
          }
        }).showToast()
        return
      }  
      const formData = new FormData()
      formData.append('csvFile', file)

      try{
        const response = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          body: formData
        })

        if(response.ok) {
          const result = await response.json()
          fileInput.value = ''
          Toastify({
            text: `${result.message}`,
            close: true,
            style: {
              background: "linear-gradient(to right, #ff3333, #D8000C)",
            }
          }).showToast()
          fetchFileList()
        } else {
          const errorData = await response.json();
          Toastify({
            text: `${errorData.error}`,
            close: true,
            style: {
              background: "linear-gradient(to right, #ff3333, #D8000C)",
            }
          }).showToast()
        }
      } catch(error) {
        console.log("error")
      }
    }
  })

  /* Function to handle deletion of a CSV file */
  const deleteCsvFile = async(id) => {
    try {
      const response = await fetch(`http://localhost:5000/upload/delete/${id}`, { method: 'DELETE' })
      const result = await response.json()
      Toastify({
        text: `${result.message}`,
        close: true,
        style: {
          background: "linear-gradient(to right, #ff3333, #D8000C)",
        }
      }).showToast()
      fetchFileList()
    } catch(error) {
      console.log(error)
    }
  }

  const searchWrapper = document.getElementById('searchWrapper')
  let currentData
  let headerData

  // Update the fetchAndDisplayCsvData function
  const fetchAndDisplayCsvData = async (fileId, page = 1, search = '') => {
    try {
      let apiUrl = `http://localhost:5000/upload/${fileId}?page=${page}&limit=${recordsPerPage}`
      if(search.trim() !== '') {
        apiUrl += `&search=${search}`
      }
      const response = await fetch(apiUrl)
      currentData  = await response.json()
      headerData = currentData.data.length !== 0 ? currentData.data[0] : {}
      paginationData.innerHTML = `${currentData.currentPage} of ${currentData.totalPages}`
      if(currentData.data.length > 0) {
        paginationWrapper.classList.add('opacity-100')
      } else {
        paginationWrapper.classList.remove('opacity-100')
      }
      displayData(currentData.data)
      displayFileName(currentData.name)
    } catch (error) {
      console.error(error)
    }
  }

  const params = new URLSearchParams(window.location.search)
  const fileId = params.get('fileId')
  const page = parseInt(params.get('page'), 10)
  const search = params.get('search') || ''
  if (fileId) {
    fetchAndDisplayCsvData(fileId, page, search)
  }

  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search)
    const fileId = params.get('fileId')
    const page = parseInt(params.get('page'), 10) || 1
    let searchValue
    if(searchTerm.trim() !== '') {
      const search = params.get('search')
      if(!search) {
        searchValue = ''
      } else {
        searchValue = search
      }
    }
    // Fetch and display data when navigating back or forward
    if (fileId) {
      fetchAndDisplayCsvData(fileId, page, searchValue)
    }
  })

  const displayFileName = (fileName) => {
    const tableHeading = document.getElementById('tableHeading')
    tableHeading.textContent = fileName
  }

  const searchInput = document.getElementById('searchInput')
  const searchBtn = document.getElementById('searchBtn')
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    updateUrl()
    fetchAndDisplayCsvData(currentFileId, currentPage, searchTerm)
  })
  searchInput.addEventListener('input', () => {
    handleSearch()
  })

  const handleSearch = () => {
    searchTerm = searchInput.value.toLowerCase()
  }

  const updateUrl = () => {
    const searchParams = new URLSearchParams()
    searchParams.set('fileId', currentFileId)
    searchParams.set('page', currentPage)
    searchParams.set('limit', recordsPerPage)
    if (searchTerm.trim() !== '') {
      searchParams.set('search', searchTerm)
    }

    const newUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`
    window.history.replaceState({}, '', newUrl)
  }

  const displayData = (csvData) => {
    try {
      // Create a dynamic table with headers and rows
      const tableContainer = document.getElementById('tableContainer');
      tableContainer.innerHTML = '';
      tableContainer.classList.add('flex', 'justify-center', 'flex-col', 'w-[90%]', 'shadow-[rgba(0,0,0,0.35)_0px_5px_15px]', 'p-4', 'm-auto', 'overflow-x-scroll')

      const tableHeading = document.createElement('h2')
      tableHeading.id = 'tableHeading'
      tableHeading.classList.add('text-center', 'text-2xl', 'font-bold', 'text-gray-800', 'mb-6')

      const table = document.createElement('table')
      const headerRow = document.createElement('tr')
      headerRow.classList.add('bg-[#90e0ef]')

      Object.keys(headerData).forEach((column) => {
        const headerCell = document.createElement('th')
        headerCell.classList.add('p-2', 'border-2')
        // Create a container for the column name and sorting buttons
        const headerContent = document.createElement('div');
        headerContent.classList.add('flex', 'items-center', 'justify-between');
  
        // Display the column name
        const columnName = document.createElement('span')
        columnName.textContent = column

        const sortWrapper = document.createElement('span')
        sortWrapper.classList.add('flex','items-center')
      
        // Create sorting buttons
        const ascendingButton = createSortingButton('asc', column);
        const descendingButton = createSortingButton('desc', column);

        // Add event listeners to sorting buttons
        ascendingButton.addEventListener('click', () => handleSort(column, 'asc'));
        descendingButton.addEventListener('click', () => handleSort(column, 'desc'));

        // Append elements to the header cell
        headerContent.appendChild(columnName)
        sortWrapper.appendChild(ascendingButton)
        sortWrapper.appendChild(descendingButton)
        headerContent.appendChild(sortWrapper)
        headerCell.appendChild(headerContent)

        headerRow.appendChild(headerCell)
      })

      table.appendChild(headerRow)
      tableContainer.appendChild(tableHeading)
      tableContainer.appendChild(table)

      if (csvData.length === 0) {
        // If no matching rows are found, display a message

        const noDataMessage = document.createElement('p')
        noDataMessage.textContent = 'No matching data found.'
        noDataMessage.classList.add('text-gray-500', 'text-lg', 'mt-4', 'text-center')
        tableContainer.appendChild(noDataMessage)
        return
      }
      searchWrapper.classList.remove('hidden')
      searchWrapper.classList.add('flex', 'items-center', 'flex-col')
      
      // Populate the table with data
      csvData.forEach((row) => {
        const dataRow = document.createElement('tr')
        dataRow.classList.add('bg-white', 'even:bg-gray-100')

        Object.values(row).forEach((value) => {
          const dataCell = document.createElement('td')
          dataCell.classList.add('p-2', 'border', 'border-2')
          dataCell.textContent = value
          dataRow.appendChild(dataCell)
        })

        table.appendChild(dataRow)
      });

      tableContainer.appendChild(table)
    } catch (error) {
      console.error(error)
    }
  }

  // Helper function to create sorting buttons
  const createSortingButton = (order, column) => {
    const button = document.createElement('button')
    button.classList.add('p-1', 'text-gray-600', 'hover:text-gray-800', 'focus:outline-none')

    const icon = document.createElement('img')
    icon.alt = 'icon'
    icon.classList.add('text-white', 'w-5', 'h-10')
    if(order === 'asc') {
      icon.classList.add('ascendingButton')
    } else {
      icon.classList.add('descendingButton')
    }
    icon.src = order === 'asc' ? 'asc.svg' : 'desc.svg'

    button.appendChild(icon)
    return button
  }

  const handleSort = (column, order) => {
    const sortedData = sortData(currentData.data, column, order)
    displayData(sortedData)
  }

  // sorting functionality
  const sortData = (data, column, order) => {
    return data.sort((a, b) => {
      const valueA = parseFloat(a[column])
      const valueB = parseFloat(b[column])

      // Check if values are numeric
      const isNumeric = !isNaN(valueA) && !isNaN(valueB);

      if (isNumeric) {
        if (order === 'asc') {
          return valueA - valueB
        } else {
          return valueB - valueA
        }
      } else {
        // If values are not numeric, use string comparison
        if (order === 'asc') {
          return a[column].localeCompare(b[column])
        } else {
          return b[column].localeCompare(a[column])
        }
      }
    })
  }

  nextPageButton.addEventListener('click', () => {
    currentPage += 1
    updateUrl()
    fetchAndDisplayCsvData(currentFileId, currentPage, searchTerm)
  })
  
  prevPageButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage -= 1
      updateUrl()
      fetchAndDisplayCsvData(currentFileId, currentPage, searchTerm)
    }
  })

})

