import mongoose, { Document, Schema, Types } from "mongoose";

export type IComparisonResult = {
  profileId: Types.ObjectId;
  similarityScore: number;
  name?: string; // optional candidate name snapshot
};

export type ITopProfile = IComparisonResult;


export interface IComparisonSession extends Document {
  jobIds: Types.ObjectId[];                   // JD(s) being used
  profileIds: Types.ObjectId[];               // All profiles compared
  results: IComparisonResult[];               // Score for each profile
  topProfiles: ITopProfile[];                 // Top 3 with scores
  createdBy: Types.ObjectId;                  // Who triggered the comparison
  createdAt: Date;
}

const ComparisonResultSchema = new Schema<IComparisonResult>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "ConsultantProfile",
      required: true,
    },
    similarityScore: { type: Number, required: true },
    name: { type: String, required: false },
  },
  { _id: false }
);

const TopProfileSchema = new Schema<ITopProfile>(
  {
    profileId: {
      type: Schema.Types.ObjectId,
      ref: "ConsultantProfile",
      required: true,
    },
    similarityScore: { type: Number, required: true },
    name: { type: String, required: false },
  },
  { _id: false }
);

const ComparisonSessionSchema = new Schema<IComparisonSession>(
  {
    jobIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "JobDescription",
        required: true,
      },
    ],
    profileIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "ConsultantProfile",
        required: true,
      },
    ],
    results: {
      type: [ComparisonResultSchema],
      required: true,
    },
    topProfiles: {
      type: [TopProfileSchema],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "ComparisonResult" }
);

const ComparisonResultModel =
mongoose.models.ComparisonResult ||
mongoose.model<IComparisonSession>("ComparisonResult", ComparisonSessionSchema);


export default ComparisonResultModel;
