import csvParser from 'csv-parser'
import { CsvFile } from '../models/csvFile.js'

/* Handle the upload of the CSV file and store in the database */
export const uploadCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  // Check file type on the server side
  const fileType = req.file.mimetype
  if (fileType !== 'text/csv') {
    return res.status(400).json({ error: 'Invalid file type. Only CSV files are allowed.' })
  }

  const fileData = req.file.buffer.toString('utf8');
  const parsedData = [];

  // Parse the CSV data
  const parseCsv = () => {
    return new Promise((resolve, reject) => {
      const stream = csvParser({ header: true })
        .on('data', (row) => {
          parsedData.push(row)
        })
        .on('end', () => {
          resolve(parsedData)
        })
        .on('error', (error) => {
          reject(error)
        });

      // Pipe the file data into the parser
      stream.write(fileData)
      stream.end()
    });
  };

  try {
    // Wait for the CSV parsing to complete
    const parsedData = await parseCsv();

    // Save the data to the db
    const newCsvFile = new CsvFile({
      name: req.file.originalname,
      data: parsedData,
    });
    await newCsvFile.save()
    res.json({ message: 'File uploaded successfully' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
};

/* To send all the CSV files present in the database */
export const csvFilesList = async (req, res) => {
  try {
    const files = await CsvFile.find({}, 'name');
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

/* To get the requested CSV file's data */
export const getCsvFileData = async (req, res) => {
  const fileId = req.params.fileId
  const { page = 1, limit = 10, search} = req.query

  try {
    const csvFile = await CsvFile.findOne({ _id: fileId })
    if(!csvFile) {
      return res.status(404).json({ error: 'File not found' })
    }
    let filteredData = csvFile.data
    let fileName = csvFile.name.split('.')[0]

    if (search) {
      const searchRegex = new RegExp(search, 'i')
      filteredData = csvFile.data.filter(row => {
        return Object.values(row).some(value => searchRegex.test(value))
      })
    }

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const paginatedData = filteredData.slice(startIndex, endIndex)

    // Return the filtered data
    return res.json({
      name: fileName,
      totalRecords: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit),
      currentPage: page,
      recordsPerPage: limit,
      data: paginatedData,
    })
  } catch(error) {
    return res.status(500).json({error: 'Internal server error'})
  }
}

/* To delete the CSV file */
export const deleteCsvFile = async (req, res) => {
  const fileId = req.params.id
  try {
    const deleteFile = await CsvFile.findOneAndDelete({ _id: fileId })

    if(!deleteFile) {
      return res.status(404).json({ error: 'File not found' })
    }

    return res.json({ message: 'File deleted successfully' })
  } catch(error) {
    return res.status(500).json({error: 'Internal server error'})
  }
}
