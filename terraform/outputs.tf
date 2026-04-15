output "instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.k3s_server.id
}

output "instance_public_ip" {
  description = "Public IP of EC2 instance"
  value       = aws_eip.k3s_eip.public_ip
}

output "instance_public_dns" {
  description = "Public DNS of EC2 instance"
  value       = aws_instance.k3s_server.public_dns
}

output "security_group_id" {
  description = "Security group attached to EC2"
  value       = aws_security_group.k3s_sg.id
}