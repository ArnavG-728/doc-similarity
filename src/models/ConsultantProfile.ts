import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConsultantProfile extends Document {
  name: string;
  resumeText: string;
  pdfFile: {
    data: string;
    mimeType: string;
    size?: number;
  };
  uploadedBy: Types.ObjectId;
  createdAt: Date;
}

const ConsultantProfileSchema = new Schema<IConsultantProfile>(
  {
    name: { type: String, required: true },
    resumeText: { type: String, required: true },
    pdfFile: {
      data: { type: String, required: true }, // base64-encoded
      mimeType: { type: String, required: true }, // should be 'application/pdf'
      size: { type: Number, required: false },
    },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ConsultantProfileModel =
  mongoose.models.ConsultantProfile ||
  mongoose.model<IConsultantProfile>(
    "ConsultantProfile",
    ConsultantProfileSchema
  );

export default ConsultantProfileModel;