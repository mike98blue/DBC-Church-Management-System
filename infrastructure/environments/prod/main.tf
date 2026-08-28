terraform {
  required_version = ">= 1.8"
  backend "s3" {}
}

module "churchos" {
  source      = "../../modules"
  environment = "prod"
}
