#!/bin/bash

# Referral Finder - Automated Setup Script
# This script helps you set up the project quickly

echo "🚀 Referral Finder - Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    echo "✅ .env.local created from template"
    echo ""
    
    # Generate NEXTAUTH_SECRET
    echo "🔑 Generating NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    
    # Update .env.local with generated secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|g" .env.local
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$SECRET|g" .env.local
    fi
    
    echo "✅ NEXTAUTH_SECRET generated and added to .env.local"
    echo ""
    
    echo "⚠️  IMPORTANT: Please edit .env.local and add:"
    echo "   - Your MongoDB URI"
    echo "   - Your OpenAI API key (or Grok API key)"
    echo "   - (Optional) Google OAuth credentials"
    echo ""
else
    echo "ℹ️  .env.local already exists. Skipping..."
    echo ""
fi

# Check if MongoDB is needed
echo "🗄️  MongoDB Setup"
echo "=================="
echo "Do you want to set up MongoDB with Docker? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        echo "   Visit: https://docs.docker.com/get-docker/"
    else
        # Check if MongoDB container already exists
        if docker ps -a | grep -q mongodb; then
            echo "ℹ️  MongoDB container already exists"
            echo "Starting MongoDB container..."
            docker start mongodb
        else
            echo "🐳 Creating and starting MongoDB container..."
            docker run -d -p 27017:27017 --name mongodb mongo
        fi
        
        if [ $? -eq 0 ]; then
            echo "✅ MongoDB is running on mongodb://localhost:27017"
            echo ""
            
            # Update .env.local with local MongoDB URI
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/referral-finder|g" .env.local
            else
                sed -i "s|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/referral-finder|g" .env.local
            fi
            
            echo "✅ .env.local updated with MongoDB URI"
        else
            echo "❌ Failed to start MongoDB container"
        fi
    fi
else
    echo "ℹ️  Skipping MongoDB setup. Please configure manually."
    echo "   You can use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your API keys:"
echo "   - OPENAI_API_KEY (or XAI_API_KEY for Grok)"
echo "   - (Optional) GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 Need help? Check out:"
echo "   - README.md for full documentation"
echo "   - SETUP.md for detailed setup guide"
echo "   - DEPLOYMENT.md for deployment instructions"
echo ""
echo "Happy coding! 🚀"

