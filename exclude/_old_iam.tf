resource "aws_iam_policy" "bad_policy" {
  name        = "${var.victim_company}_bad_policy"
  path        = "/"
  description = "Some policy that allows everything"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:*",
          "s3:*",
          "dynamodb:*"
        ]
        Effect   = "Allow"
        Resource = "*"
      },
    ]
  })
  tags = {
  Owner = var.owner
  }
}

resource "aws_iam_instance_profile" "tfgoof_profile" {
  name = "${var.victim_company}_profile"
  role = aws_iam_role.tfgoof_role.name
  tags = {
  Owner = var.owner
  }
}
resource "aws_iam_role" "tfgoof_role" {
  name = "${var.victim_company}_role"
  path = "/"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          AWS = "*"
        }
      },
    ]
  })
  tags = {
  Owner = var.owner
  }
}
