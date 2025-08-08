import mongoose, { Document, Schema, Types } from "mongoose";

export interface IJobDescription extends Document {
  title: string;
  content: string;
  pdfFile: {
    data: string;
    mimeType: string;
    size: number;
  };
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

const JobDescriptionSchema = new Schema<IJobDescription>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    pdfFile: {
      data: { type: String, required: true },
      mimeType: { type: String, required: true },
      size: { type: Number, required: true },
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const JobDescriptionModel =
  mongoose.models.JobDescription ||
  mongoose.model<IJobDescription>("JobDescription", JobDescriptionSchema);

export default JobDescriptionModel;
