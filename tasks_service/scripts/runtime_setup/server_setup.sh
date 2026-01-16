yum update -y
yum install -y ruby wget

cd /home/ec2-user
wget https://aws-codedeploy-${var.aws_region}.s3.${var.aws_region}.amazonaws.com/latest/install
chmod +x ./install
./install auto

# Install Bun for ec2-user
sudo -u ec2-user bash -c "curl -fsSL https://bun.sh/install | bash"
echo 'export PATH="$HOME/.bun/bin:$PATH"' >> /home/ec2-user/.bashrc

# Create application directory
mkdir -p /opt/tasks-service
chown ec2-user:ec2-user /opt/tasks-service
cp tasks_service.service /etc/systemd/system/tasks-service.service