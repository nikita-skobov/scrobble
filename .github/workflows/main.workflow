workflow "main" {
  resolves = ["gzip"]
  on = "push"
}

action "npm installs" {
  uses = "actions/setup-node@466ce3c2f054e6fb3334405593b1ec7892f00f37"
  args = "npm install"
}

action "gzip" {
  uses = "actions/setup-node@466ce3c2f054e6fb3334405593b1ec7892f00f37"
  needs = ["npm installs"]
  runs = "../deployment/gzip_all.sh"
}
