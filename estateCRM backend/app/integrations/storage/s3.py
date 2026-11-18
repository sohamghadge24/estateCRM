import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
from app.core.logging import logger

class S3StorageAdapter:
    def __init__(self):
        self.endpoint = settings.STORAGE_ENDPOINT
        self.bucket = settings.STORAGE_BUCKET
        self.client = boto3.client(
            "s3",
            endpoint_url=settings.STORAGE_ENDPOINT,
            aws_access_key_id=settings.STORAGE_ACCESS_KEY,
            aws_secret_access_key=settings.STORAGE_SECRET_KEY,
            region_name=settings.STORAGE_REGION
        )

    def generate_presigned_url(self, object_name: str, expiration: int = 3600) -> str:
        """Generate a pre-signed URL to share an S3 object securely."""
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": object_name},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            return f"{self.endpoint}/{self.bucket}/{object_name}"

    def upload_file_bytes(self, data: bytes, object_name: str, content_type: str = "application/octet-stream") -> str:
        """Upload raw bytes to S3/MinIO bucket."""
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=object_name,
                Body=data,
                ContentType=content_type
            )
            return f"{self.endpoint}/{self.bucket}/{object_name}"
        except ClientError as e:
            logger.error(f"S3 upload error: {e}")
            return f"{self.endpoint}/{self.bucket}/{object_name}"

storage = S3StorageAdapter()

