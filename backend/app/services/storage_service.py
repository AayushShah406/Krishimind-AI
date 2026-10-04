import os
import uuid
from typing import Tuple
from fastapi import UploadFile
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

    async def save_image(self, file: UploadFile) -> Tuple[str, str]:
        """
        Saves uploaded crop image to disk or S3 object storage.
        Returns (image_key, public_or_local_url)
        """
        ext = file.filename.split(".")[-1].lower() if "." in file.filename else "jpg"
        if ext not in ["jpg", "jpeg", "png", "webp"]:
            ext = "jpg"
        file_id = f"{uuid.uuid4().hex}.{ext}"
        destination = os.path.join(self.upload_dir, file_id)

        content = await file.read()
        with open(destination, "wb") as f:
            f.write(content)

        # URL path served through FastAPI static mount
        url = f"/uploads/{file_id}"
        return file_id, url

storage_service = StorageService()
