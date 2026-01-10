# Use existing IAM role "vocrole"
data "aws_iam_role" "vocrole" {
  name = "vocrole"
}

# IAM instance profile for EC2 (using existing vocrole)
# Note: The instance profile name may differ from the role name
# Update iam_instance_profile_name variable if your instance profile has a different name
data "aws_iam_instance_profile" "vocrole" {
  name = var.iam_instance_profile_name
}
