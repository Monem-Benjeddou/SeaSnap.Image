ImageFlow - Multi-Tenant Image Management System
ImageFlow is a robust, multi-tenant image management system designed to allow multiple companies to securely store, manage, and organize their image assets. Each company operates in an isolated environment, with its own set of users and administrative controls.

Features
Multi-Tenancy: Secure isolation of data and users per company.

Company-Specific User Management: Each company's admin can invite and manage users within their own company.

Image Upload & Storage: Upload and manage image files.

Image Gallery: Browse, search, filter, and preview images.

Role-Based Access Control (RBAC): Differentiated permissions for CompanyAdmin, Editor, and Viewer roles within each company.

Image Metadata: Store filename, size, type, description, and tags.

Dynamic Image Preview & Download: Preview images and download original files.

Responsive UI: Optimized for various screen sizes.

Modern Frontend: Built with React and Ant Design for a rich user experience.

Technologies Used
Backend
Framework: .NET 8

Database: PostgreSQL 8 (for user, company, and image metadata)

ORM: Entity Framework Core

Authentication & Authorization: ASP.NET Core Identity

File Storage: SeaweedFS (for actual image binary storage)

API: ASP.NET Core Web API

Frontend
Framework: React

UI Library: Ant Design

Styling: Tailwind CSS

Animations: Framer Motion

State Management: Zustand (or similar, based on useAuthStore usage)

Routing: React Router DOM

Architecture Overview
ImageFlow implements a multi-tenant architecture where each "company" is treated as a separate tenant.

Company Isolation:

Every User record is linked to a Company via a CompanyId.

Every ImageMetadata record is also linked to a Company via a CompanyId.

Global Query Filters: Entity Framework Core Global Query Filters are used on the backend to automatically scope data queries. This ensures that when a user requests images or lists users, only data associated with their CompanyId is returned. This provides strong data isolation at the database level.

Company-Scoped Roles:

CompanyAdmin: Users with this role within a specific company can manage other users (Editor, Viewer) and resources only for their company.

Editor: Can upload, edit, and delete images within their company.

Viewer: Can view images within their company.

Tenant Identification: The authenticated user's CompanyId is stored as a claim in their authentication token (JWT). A dedicated ITenantService on the backend retrieves this CompanyId from claims, making it available for context-aware operations and global query filters.

Image Storage with SeaweedFS: Image binaries are stored externally in SeaweedFS, with metadata (filename, URL, size, etc.) stored in PostgreSQL. Each image's URL or access path is associated with its metadata and, by extension, its CompanyId.

Getting Started
Follow these instructions to set up and run the ImageFlow project on your local machine.

Prerequisites
.NET 8 SDK

Node.js (LTS recommended) and npm or yarn

PostgreSQL 8 (or later) installed and running

SeaweedFS (Master and Volume servers) installed and running

Git

1. Backend Setup (.NET 8 API)
Clone the repository:

git clone [your-repo-url]
cd ImageFlow/Backend

Configure PostgreSQL:

Create a new PostgreSQL database (e.g., ImageFlowDB).

Update the connection string in appsettings.json (or appsettings.Development.json) to point to your PostgreSQL instance:

{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=ImageFlowDB;Username=your_username;Password=your_password"
  },
  // ... other settings
}

Configure SeaweedFS:

Ensure your SeaweedFS Master and Volume servers are running.

Update configuration in appsettings.json with your SeaweedFS access details (if any specific configuration is needed beyond default URLs).

Apply Database Migrations:

Navigate to the project directory where your *.csproj file is located (e.g., SeaSnap.Images.Api or similar).

dotnet ef database update

This will create the necessary tables for Identity, Company, User, and ImageMetadata, and seed initial roles, companies, and an admin user.

Run the Backend:

dotnet run

The API will typically run on https://localhost:5001 (or a similar port).

2. Frontend Setup (React App)
Navigate to the frontend directory:

cd ../Frontend # Assuming frontend is in a sibling directory

Install dependencies:

npm install
# or
yarn install

Configure API Endpoint:

If your backend is not running on the default localhost:5001, update the API base URL in your frontend code (e.g., in an .env file or config.js).

REACT_APP_API_BASE_URL=https://localhost:5001/api

Run the Frontend:

npm start
# or
yarn start

The React application will typically open in your browser at http://localhost:3000.

Usage
Company Registration/Initial Admin:

Currently, initial companies and their first CompanyAdmin users are seeded via migrations. Use the credentials of a seeded CompanyAdmin to log in.

Default Admin Credentials (from seed):

Company: Acme Corporation

Username (Email): admin@acmecorp.com

Password: Admin@123!zh5 (Please change this in a production environment!)

Login: Access the frontend application through your browser and log in with the admin credentials.

Invite Users: As a CompanyAdmin, navigate to the "Users" or "User Management" section to invite new users (Editor or Viewer roles) to your company. These users will be automatically linked to your company.

Image Management: Use the "Upload" section to add images. Browse and manage them in the "Images" gallery. Note that users will only see images belonging to their assigned company.

Contributing
Contributions are welcome! Please follow standard Git Flow:

Fork the repository.

Create a new branch for your feature or bug fix.

Commit your changes following conventional commit messages.

Push to your fork.

Open a pull request.

License
This project is licensed under the MIT License. See the LICENSE file for details.