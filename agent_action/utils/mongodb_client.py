import motor.motor_asyncio
from pymongo import MongoClient
from typing import Optional, Dict, Any, List
import asyncio
from config import MONGODB_URI, MONGODB_DB_NAME, MONGODB_COLLECTIONS

class MongoDBClient:
    def __init__(self):
        self.client = None
        self.db = None
        self.async_client = None
        self.async_db = None
        
    def connect(self):
        """Connect to MongoDB synchronously"""
        try:
            self.client = MongoClient(MONGODB_URI)
            self.db = self.client[MONGODB_DB_NAME]
            print(f"Connected to MongoDB: {MONGODB_DB_NAME}")
            return True
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return False
    
    async def connect_async(self):
        """Connect to MongoDB asynchronously"""
        try:
            self.async_client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
            self.async_db = self.async_client[MONGODB_DB_NAME]
            print(f"Connected to MongoDB asynchronously: {MONGODB_DB_NAME}")
            return True
        except Exception as e:
            print(f"Error connecting to MongoDB asynchronously: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
        if self.async_client:
            self.async_client.close()
    
    def get_collection(self, collection_name: str):
        """Get a collection synchronously"""
        if self.db is None:
            self.connect()
        return self.db[collection_name]
    
    async def get_collection_async(self, collection_name: str):
        """Get a collection asynchronously"""
        if self.async_db is None:
            await self.connect_async()
        return self.async_db[collection_name]
    
    # Profile operations
    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get profile by user ID"""
        collection = self.get_collection(MONGODB_COLLECTIONS["profiles"])
        return collection.find_one({"id": user_id})
    
    async def get_profile_async(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get profile by user ID asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["profiles"])
        result = await collection.find_one({"id": user_id})
        if result and '_id' in result:
            result['_id'] = str(result['_id'])
        return result
    
    def create_profile(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """Create a new profile"""
        collection = self.get_collection(MONGODB_COLLECTIONS["profiles"])
        result = collection.insert_one(profile_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    async def create_profile_async(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """Create a new profile asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["profiles"])
        result = await collection.insert_one(profile_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    # Job Description operations
    def get_job_descriptions(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get job descriptions"""
        collection = self.get_collection(MONGODB_COLLECTIONS["job_descriptions"])
        filter_query = {"created_by": user_id} if user_id else {}
        return list(collection.find(filter_query).sort("created_at", -1))
    
    async def get_job_descriptions_async(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get job descriptions asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["job_descriptions"])
        filter_query = {"created_by": user_id} if user_id else {}
        cursor = collection.find(filter_query).sort("created_at", -1)
        results = await cursor.to_list(length=None)
        # Convert ObjectIds to strings
        for result in results:
            if '_id' in result:
                result['_id'] = str(result['_id'])
        return results
    
    def get_job_description(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job description by ID"""
        collection = self.get_collection(MONGODB_COLLECTIONS["job_descriptions"])
        return collection.find_one({"id": job_id})
    
    async def get_job_description_async(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job description by ID asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["job_descriptions"])
        return await collection.find_one({"id": job_id})
    
    def create_job_description(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Create a new job description"""
        collection = self.get_collection(MONGODB_COLLECTIONS["job_descriptions"])
        result = collection.insert_one(job_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    async def create_job_description_async(self, job_data: Dict[str, Any]) -> Optional[str]:
        """Create a new job description asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["job_descriptions"])
        result = await collection.insert_one(job_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    # Consultant Profile operations
    def get_consultant_profiles(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get consultant profiles"""
        collection = self.get_collection(MONGODB_COLLECTIONS["consultant_profiles"])
        filter_query = {"created_by": user_id} if user_id else {}
        return list(collection.find(filter_query).sort("created_at", -1))
    
    async def get_consultant_profiles_async(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get consultant profiles asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["consultant_profiles"])
        filter_query = {"created_by": user_id} if user_id else {}
        cursor = collection.find(filter_query).sort("created_at", -1)
        results = await cursor.to_list(length=None)
        # Convert ObjectIds to strings
        for result in results:
            if '_id' in result:
                result['_id'] = str(result['_id'])
        return results
    
    def get_consultant_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """Get consultant profile by ID"""
        collection = self.get_collection(MONGODB_COLLECTIONS["consultant_profiles"])
        return collection.find_one({"id": profile_id})
    
    async def get_consultant_profile_async(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """Get consultant profile by ID asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["consultant_profiles"])
        return await collection.find_one({"id": profile_id})
    
    def create_consultant_profile(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """Create a new consultant profile"""
        collection = self.get_collection(MONGODB_COLLECTIONS["consultant_profiles"])
        result = collection.insert_one(profile_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    async def create_consultant_profile_async(self, profile_data: Dict[str, Any]) -> Optional[str]:
        """Create a new consultant profile asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["consultant_profiles"])
        result = await collection.insert_one(profile_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    # Comparison Result operations
    def get_comparison_results(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get comparison results"""
        collection = self.get_collection(MONGODB_COLLECTIONS["comparison_results"])
        filter_query = {"created_by": user_id} if user_id else {}
        return list(collection.find(filter_query).sort("created_at", -1))
    
    async def get_comparison_results_async(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get comparison results asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["comparison_results"])
        filter_query = {"created_by": user_id} if user_id else {}
        cursor = collection.find(filter_query).sort("created_at", -1)
        results = await cursor.to_list(length=None)
        # Convert ObjectIds to strings
        for result in results:
            if '_id' in result:
                result['_id'] = str(result['_id'])
        return results
    
    def create_comparison_result(self, result_data: Dict[str, Any]) -> Optional[str]:
        """Create a new comparison result"""
        collection = self.get_collection(MONGODB_COLLECTIONS["comparison_results"])
        result = collection.insert_one(result_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    async def create_comparison_result_async(self, result_data: Dict[str, Any]) -> Optional[str]:
        """Create a new comparison result asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["comparison_results"])
        result = await collection.insert_one(result_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    # Report operations
    def save_report(self, report_data: Dict[str, Any]) -> Optional[str]:
        """Save a report"""
        collection = self.get_collection(MONGODB_COLLECTIONS["reports"])
        result = collection.insert_one(report_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    async def save_report_async(self, report_data: Dict[str, Any]) -> Optional[str]:
        """Save a report asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["reports"])
        result = await collection.insert_one(report_data)
        return str(result.inserted_id) if result.inserted_id else None
    
    def get_reports(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get reports"""
        collection = self.get_collection(MONGODB_COLLECTIONS["reports"])
        filter_query = {"created_by": user_id} if user_id else {}
        return list(collection.find(filter_query).sort("created_at", -1))
    
    async def get_reports_async(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get reports asynchronously"""
        collection = await self.get_collection_async(MONGODB_COLLECTIONS["reports"])
        filter_query = {"created_by": user_id} if user_id else {}
        cursor = collection.find(filter_query).sort("created_at", -1)
        results = await cursor.to_list(length=None)
        # Convert ObjectIds to strings
        for result in results:
            if '_id' in result:
                result['_id'] = str(result['_id'])
        return results

# Global MongoDB client instance
mongodb_client = MongoDBClient() 