# 🖼️ ImageFlow - Multi-Tenant Image Management System

**ImageFlow** is a robust, multi-tenant image management system designed to allow multiple companies to securely store, manage, and organize their image assets. Each company operates in an isolated environment, with its own set of users and administrative controls.

---

## ✨ Features

- **Multi-Tenancy**: Secure isolation of data and users per company
- **Company-Specific User Management**: Admins can invite/manage users within their company
- **Image Upload & Storage**: Upload, store, preview, and download images
- **Image Gallery**: Browse, search, filter, and preview images
- **Role-Based Access Control (RBAC)**: CompanyAdmin, Editor, and Viewer roles
- **Image Metadata**: Store filename, size, type, description, and tags
- **Dynamic Image Preview & Download**
- **Responsive UI**: Optimized for all screen sizes
- **Modern Frontend**: Built with React + Ant Design

---

## 🛠 Technologies Used

| Layer | Tech |
|---|---|
| **Backend** | .NET 8, ASP.NET Core Web API, EF Core, ASP.NET Core Identity |
| **Database** | PostgreSQL 8 |
| **File Storage** | SeaweedFS |
| **Frontend** | React, Ant Design, Tailwind CSS, Framer Motion |
| **State Management** | Zustand |
| **Routing** | React Router DOM |

---

## 🏛️ Architecture Overview

### 🔐 Company Isolation

- Each `User` and `ImageMetadata` record is linked to a `CompanyId`
- Global Query Filters in EF Core ensure strict data scoping
- Users only see data belonging to their company

### 👥 Roles

- **CompanyAdmin**: Manage users & images for their company
- **Editor**: Upload/edit/delete images
- **Viewer**: View images

### 🔑 Tenant Identification

- JWT tokens include `CompanyId` as a claim
- A `ITenantService` fetches this claim for scoped operations

### 🗃️ Image Storage

- Binaries stored in SeaweedFS
- Metadata (filename, URL, size, etc.) stored in PostgreSQL

---

## 🚀 Getting Started

### ✅ Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/)
- Node.js (LTS) & npm or yarn
- PostgreSQL 8+
- SeaweedFS (master + volume servers)
- Git

---

## ⚙️ Backend Setup (.NET 8 API)

```bash
git clone [your-repo-url]
cd ImageFlow/Backend
