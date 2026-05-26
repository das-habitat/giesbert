variable "REGISTRY" {
  default = "ghcr.io/das-habitat/giesbert"
}

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
    "${REGISTRY}/server:${TAG}",
    "${REGISTRY}/server:latest"
  ]
}

target "pwa" {
  context    = "."
  dockerfile = "deployment/pwa.Dockerfile"
  platform   = ["linux/amd64"]
  tags = [
    "${REGISTRY}/pwa:${TAG}",
    "${REGISTRY}/pwa:latest"
  ]
}
