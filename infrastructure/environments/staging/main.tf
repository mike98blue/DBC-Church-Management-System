terraform {
  required_version = ">= 1.8"
  backend "s3" {
    # Replace with your state bucket — never commit real bucket names with secrets
    # bucket = "churchos-tofu-state"
    # key    = "staging/terraform.tfstate"
    # region = "us-east-1"
  }
}

module "churchos" {
  source      = "../../modules"
  environment = "staging"
}
