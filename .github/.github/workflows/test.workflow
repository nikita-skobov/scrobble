workflow "New workflow" {
  on = "push"
  resolves = ["GitHub Action for AWS"]
}

action "GitHub Action for AWS" {
  uses = "actions/aws/cli@4ebe93e938e5a1221032aa7754ef76074f013911"
  secrets = ["UASECRET", "NIKITAS_LINK_CERTID", "NIKITAS_LINK_HZNAME", "S3_BUCKET", "AWS_ACCOUNT"]
}
