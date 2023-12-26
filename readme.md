# CSV Upload and Display App

## Overview

This is a web application that allows users to upload CSV files, display a list of uploaded files, and view the data from a selected CSV file in a dynamic table. The application includes search functionality, dynamic table headers, sorting options, and supports pagination for efficient data display.

## Project Structure

- `frontend/`: Contains the frontend code (HTML, CSS, JavaScript).
- `backend/`: Contains the backend code (Node.js, Express.js, MongoDB).

## Features

- **CSV File Upload:**
  - Users can upload CSV files using the provided form.
  - The system considers the comma (',') as the default delimiter.

- **List of Uploaded CSV Files:**
  - The application displays a list of all uploaded CSV files, allowing users to manage and select files for further exploration.

- **Dynamic Table Display:**
  - Upon selecting a CSV file, the system displays the data in a dynamic table with column headers.

- **Search Functionality:**
  - Users can search for specific rows by entering a search term in the search box.
  - The search is performed on a chosen column, and matching rows are displayed.

- **Dynamic Table Headers:**
  - The application dynamically generates table headers based on the columns present in the selected CSV file.

- **Sorting Options:**
  - For enhanced user experience, sorting buttons (ascending and descending) are provided for each column.

- **File Type Validation:**
  - Both front-end and server-side validations ensure that only CSV files are accepted for upload.

- **Pagination:**
  - The displayed data in the table supports pagination, limiting records to a maximum of 10 per page.

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB

## Getting Started

1. Clone the repository:

   ```
   git clone https://github.com/virochan999/Csv-File-uploader.git
   cd Csv-File-uploader

   ```
2. For Frontend:
  ```
  cd Frontend
  npm install
  npm run dev
  ```

3. For Backend:
  ```
  cd Backend
  npm install
  npm run dev
  ```
