import express from "express";
import multer from "multer";
import { csvFilesList, getCsvFileData, uploadCsv, deleteCsvFile } from "../controllers/csvController.js";

const csvFileRouter = express.Router()
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
csvFileRouter.use(express.json())

csvFileRouter.post('/',
  upload.single('csvFile') , uploadCsv
)

csvFileRouter.get('/list', csvFilesList)

csvFileRouter.get('/:fileId', getCsvFileData)

csvFileRouter.delete('/delete/:id', deleteCsvFile)

export default csvFileRouter