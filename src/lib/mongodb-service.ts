import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

// MongoDB Types
export interface Profile {
  _id?: ObjectId;
  id: string;
  email: string;
  role: 'AR Requestor' | 'Recruiter Admin';
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  _id?: ObjectId;
  id: string;
  title: string;
  description: string;
  requirements: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ConsultantProfile {
  _id?: ObjectId;
  id: string;
  name: string;
  skills: string[];
  experience: string;
  education: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface ComparisonResult {
  _id?: ObjectId;
  id: string;
  job_description_id: string;
  consultant_profile_id: string;
  similarity_score: number;
  analysis_result: string;
  created_at: string;
  created_by: string;
}

export class MongoDBService {
  // Profile operations
  static async getProfile(userId: string): Promise<Profile | null> {
    try {
      const collection = await getCollection('profiles');
      const profile = await collection.findOne({ id: userId });
      return profile as Profile | null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  static async createProfile(profile: Omit<Profile, '_id'>): Promise<Profile | null> {
    try {
      const collection = await getCollection('profiles');
      const result = await collection.insertOne(profile);
      return { ...profile, _id: result.insertedId } as Profile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  }

  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
    try {
      const collection = await getCollection('profiles');
      const result = await collection.findOneAndUpdate(
        { id: userId },
        { $set: { ...updates, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      return result as Profile | null;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  // Job Description operations
  static async getJobDescriptions(userId?: string): Promise<JobDescription[]> {
    try {
      const collection = await getCollection('job_descriptions');
      const filter = userId ? { created_by: userId } : {};
      const jobDescriptions = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();
      return jobDescriptions as JobDescription[];
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
      return [];
    }
  }

  static async getJobDescription(id: string): Promise<JobDescription | null> {
    try {
      const collection = await getCollection('job_descriptions');
      const jobDescription = await collection.findOne({ id });
      return jobDescription as JobDescription | null;
    } catch (error) {
      console.error('Error fetching job description:', error);
      return null;
    }
  }

  static async createJobDescription(jobDescription: Omit<JobDescription, '_id'>): Promise<JobDescription | null> {
    try {
      const collection = await getCollection('job_descriptions');
      const result = await collection.insertOne(jobDescription);
      return { ...jobDescription, _id: result.insertedId } as JobDescription;
    } catch (error) {
      console.error('Error creating job description:', error);
      return null;
    }
  }

  static async updateJobDescription(id: string, updates: Partial<JobDescription>): Promise<JobDescription | null> {
    try {
      const collection = await getCollection('job_descriptions');
      const result = await collection.findOneAndUpdate(
        { id },
        { $set: { ...updates, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      return result as JobDescription | null;
    } catch (error) {
      console.error('Error updating job description:', error);
      return null;
    }
  }

  static async deleteJobDescription(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('job_descriptions');
      const result = await collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting job description:', error);
      return false;
    }
  }

  // Consultant Profile operations
  static async getConsultantProfiles(userId?: string): Promise<ConsultantProfile[]> {
    try {
      const collection = await getCollection('consultant_profiles');
      const filter = userId ? { created_by: userId } : {};
      const profiles = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();
      return profiles as ConsultantProfile[];
    } catch (error) {
      console.error('Error fetching consultant profiles:', error);
      return [];
    }
  }

  static async getConsultantProfile(id: string): Promise<ConsultantProfile | null> {
    try {
      const collection = await getCollection('consultant_profiles');
      const profile = await collection.findOne({ id });
      return profile as ConsultantProfile | null;
    } catch (error) {
      console.error('Error fetching consultant profile:', error);
      return null;
    }
  }

  static async createConsultantProfile(profile: Omit<ConsultantProfile, '_id'>): Promise<ConsultantProfile | null> {
    try {
      const collection = await getCollection('consultant_profiles');
      const result = await collection.insertOne(profile);
      return { ...profile, _id: result.insertedId } as ConsultantProfile;
    } catch (error) {
      console.error('Error creating consultant profile:', error);
      return null;
    }
  }

  static async updateConsultantProfile(id: string, updates: Partial<ConsultantProfile>): Promise<ConsultantProfile | null> {
    try {
      const collection = await getCollection('consultant_profiles');
      const result = await collection.findOneAndUpdate(
        { id },
        { $set: { ...updates, updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      return result as ConsultantProfile | null;
    } catch (error) {
      console.error('Error updating consultant profile:', error);
      return null;
    }
  }

  static async deleteConsultantProfile(id: string): Promise<boolean> {
    try {
      const collection = await getCollection('consultant_profiles');
      const result = await collection.deleteOne({ id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting consultant profile:', error);
      return false;
    }
  }

  // Comparison Result operations
  static async getComparisonResults(userId?: string): Promise<ComparisonResult[]> {
    try {
      const collection = await getCollection('comparison_results');
      const filter = userId ? { created_by: userId } : {};
      const results = await collection
        .find(filter)
        .sort({ created_at: -1 })
        .toArray();
      return results as ComparisonResult[];
    } catch (error) {
      console.error('Error fetching comparison results:', error);
      return [];
    }
  }

  static async createComparisonResult(result: Omit<ComparisonResult, '_id'>): Promise<ComparisonResult | null> {
    try {
      const collection = await getCollection('comparison_results');
      const insertResult = await collection.insertOne(result);
      return { ...result, _id: insertResult.insertedId } as ComparisonResult;
    } catch (error) {
      console.error('Error creating comparison result:', error);
      return null;
    }
  }

  static async getComparisonResult(id: string): Promise<ComparisonResult | null> {
    try {
      const collection = await getCollection('comparison_results');
      const result = await collection.findOne({ id });
      return result as ComparisonResult | null;
    } catch (error) {
      console.error('Error fetching comparison result:', error);
      return null;
    }
  }
} 