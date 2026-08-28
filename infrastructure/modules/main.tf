# OpenTofu — ChurchOS infrastructure
# Each environment (dev/staging/prod) is a root module that composes `../modules/*`.
# Apply with: `tofu -chdir=infrastructure/environments/staging init && tofu plan`

terraform {
  required_version = ">= 1.8"
  required_providers {
    aws = { source = "hashicorp/aws", version = ">= 5.0" }
  }
}

variable "environment" {
  type        = string
  description = "dev | staging | prod"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

output "environment" {
  value = var.environment
}
