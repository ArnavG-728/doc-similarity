#!/usr/bin/env python3
"""
Simple test to debug MongoDB ObjectId issue
"""

import asyncio
import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from utils.mongodb_client import mongodb_client
from bson import ObjectId

async def test_simple():
    """Simple test to see what's happening"""
    try:
        print("1. Connecting to MongoDB...")
        await mongodb_client.connect_async()
        
        print("2. Getting job descriptions...")
        job_descriptions = await mongodb_client.get_job_descriptions_async()
        
        print(f"3. Retrieved {len(job_descriptions)} job descriptions")
        
        if job_descriptions:
            print(f"4. First doc type: {type(job_descriptions[0])}")
            print(f"5. First doc keys: {list(job_descriptions[0].keys())}")
            print(f"6. First doc _id: {job_descriptions[0].get('_id')}")
            print(f"7. First doc _id type: {type(job_descriptions[0].get('_id'))}")
            
            # Test serialization
            print("8. Testing serialization...")
            serialized = []
            for doc in job_descriptions:
                serialized_doc = {}
                for key, value in doc.items():
                    if isinstance(value, ObjectId):
                        serialized_doc[key] = str(value)
                    else:
                        serialized_doc[key] = value
                serialized.append(serialized_doc)
            
            print(f"9. Serialized successfully: {len(serialized)} docs")
            print(f"10. First serialized doc: {serialized[0]}")
            
        else:
            print("4. No job descriptions found")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        mongodb_client.disconnect()

if __name__ == "__main__":
    asyncio.run(test_simple()) 