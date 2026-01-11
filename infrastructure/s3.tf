resource "aws_s3_bucket" "build_artifacts" {
  bucket_prefix = "build-artifacts"

  tags = merge(local.common_tags, {
    Name = "build-artifacts"
  })
}

resource "aws_s3_bucket_versioning" "build_artifacts" {
  bucket = aws_s3_bucket.build_artifacts.id

  versioning_configuration {
    status = "Enabled"
  }
  
  depends_on = [aws_s3_bucket.build_artifacts]
}

resource "aws_s3_bucket_public_access_block" "build_artifacts" {
  bucket = aws_s3_bucket.build_artifacts.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  depends_on = [aws_s3_bucket.build_artifacts]
}
