import boto3
import os
from botocore.exceptions import NoCredentialsError
from io import BytesIO

class S3Manager:
    def __init__(self):
        self.bucket_name = os.getenv("AWS_S3_BUCKET", "triya-autolca-storage")
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
            aws_secret_access_key=os.getenv("AWS_SECRET_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )

    def upload_file(self, file_obj, object_name):
        try:
            self.s3.upload_fileobj(file_obj, self.bucket_name, object_name)
            return f"https://{self.bucket_name}.s3.amazonaws.com/{object_name}"
        except NoCredentialsError:
            print("Credentials not available")
            return None

    def get_file(self, object_name):
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=object_name)
            return response['Body'].read()
        except Exception as e:
            print(f"Error fetching from S3: {e}")
            return None

# Singleton instance
s3_manager = S3Manager()
