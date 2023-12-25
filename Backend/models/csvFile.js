import mongoose from "mongoose"

const csvFileSchema = new mongoose.Schema({
  name: String,
  data: mongoose.Schema.Types.Mixed,
})

export const CsvFile = mongoose.model('CsvFile', csvFileSchema) 
