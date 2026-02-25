variable "TAG" {
  default = "latest"
}

group "default" {
  targets = [
    "server",
    "pwa"
  ]
}

target "server" {
  context    = "."
  dockerfile = "deployment/server.Dockerfile"
  platform   = ["linux/amd64"]
  tags = [
    "giesbert/server:${TAG}",
    "giesbert/server:latest"
  ]
}

target "pwa" {
  context    = "."
  dockerfile = "deployment/pwa.Dockerfile"
  platform   = ["linux/amd64"]
  tags = [
    "giesbert/pwa:${TAG}",
    "giesbert/pwa:latest"
  ]
}
