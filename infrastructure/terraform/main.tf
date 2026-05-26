terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"
}

# SSH Key pair
resource "aws_key_pair" "deployer" {
  key_name   = "resume-analyzer-key"
  public_key = file("~/.ssh/resume-analyzer-key.pub")
}

# Security Group
resource "aws_security_group" "backend" {
  name        = "resume-analyzer-sg"
  description = "Allow HTTP, HTTPS and SSH"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH"
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }
  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "FastAPI"
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "resume-analyzer-sg"
    Project = "resume-analyzer"
  }
}

# IAM Role for EC2
resource "aws_iam_role" "ec2_role" {
  name = "resume-analyzer-ec2-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ec2_policy" {
  name = "resume-analyzer-policy"
  role = aws_iam_role.ec2_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:PutObject","s3:GetObject","s3:DeleteObject","s3:ListBucket"]
        Resource = [
          aws_s3_bucket.resumes.arn,
          "${aws_s3_bucket.resumes.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem","dynamodb:GetItem","dynamodb:Query","dynamodb:Scan"]
        Resource = aws_dynamodb_table.scores.arn
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "resume-analyzer-profile"
  role = aws_iam_role.ec2_role.name
}

# S3 bucket for resume PDFs
resource "aws_s3_bucket" "resumes" {
  bucket = "resume-analyzer-pdfs-203374879162"
  tags   = { Project = "resume-analyzer" }
}

resource "aws_s3_bucket_versioning" "resumes" {
  bucket = aws_s3_bucket.resumes.id
  versioning_configuration { status = "Enabled" }
}

# S3 bucket for frontend
resource "aws_s3_bucket" "frontend" {
  bucket = "resume-analyzer-frontend-203374879162"
  tags   = { Project = "resume-analyzer" }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  index_document { suffix = "index.html" }
  error_document  { key    = "index.html" }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket                  = aws_s3_bucket.frontend.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket     = aws_s3_bucket.frontend.id
  depends_on = [aws_s3_bucket_public_access_block.frontend]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.frontend.arn}/*"
    }]
  })
}

# DynamoDB for scores
resource "aws_dynamodb_table" "scores" {
  name         = "ResumeScores"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "sessionId"
  attribute {
    name = "sessionId"
    type = "S"
  }
  tags = { Project = "resume-analyzer" }
}

# EC2 t3.micro FREE TIER
resource "aws_instance" "backend" {
  ami                    = "ami-07b301a23def3266d"
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.deployer.key_name
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.backend.id]

  user_data = base64encode(<<-USERDATA
    #!/bin/bash
    apt-get update -y
    apt-get install -y python3 python3-pip git nginx
    pip3 install fastapi uvicorn pdfplumber python-multipart boto3
    cd /home/ubuntu
    git clone https://github.com/thara-user/resume-analyzer.git
    cd resume-analyzer/backend
    cat > /etc/systemd/system/resume-api.service << 'SERVICE'
    [Unit]
    Description=Resume Analyzer API
    After=network.target
    [Service]
    User=ubuntu
    WorkingDirectory=/home/ubuntu/resume-analyzer/backend
    ExecStart=/usr/local/bin/uvicorn main:app --host 0.0.0.0 --port 8000
    Restart=always
    [Install]
    WantedBy=multi-user.target
    SERVICE
    systemctl daemon-reload
    systemctl enable resume-api
    systemctl start resume-api
  USERDATA
  )

  tags = {
    Name    = "resume-analyzer-backend"
    Project = "resume-analyzer"
  }
}

# Outputs
output "ec2_public_ip" {
  value       = aws_instance.backend.public_ip
  description = "EC2 public IP — use this for API URL"
}

output "s3_frontend_bucket" {
  value       = aws_s3_bucket.frontend.bucket
  description = "S3 bucket for frontend files"
}

output "s3_resume_bucket" {
  value       = aws_s3_bucket.resumes.bucket
  description = "S3 bucket for resume PDFs"
}

output "dynamodb_table" {
  value       = aws_dynamodb_table.scores.name
  description = "DynamoDB table name"
}

output "frontend_url" {
  value       = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
  description = "Frontend S3 website URL"
}
