# Enterprise Procurement System

A Spring Boot REST API backend supporting user registration, category-based procurement requests, single-admin approvals, and supplier management.

---

## Tech Stack

- **Framework**: Java 21, Spring Boot 4.1
- **Security**: Spring Security 6, JWT (`io.jsonwebtoken` 0.12.6)
- **Email Service**: Spring Boot Mail (`JavaMailSender`), Gmail SMTP
- **Database**: Spring Data JPA, MySQL
- **Documentation**: Swagger UI / OpenAPI 3 (`springdoc-openapi-starter-webmvc-ui`)

---

## Database Schema (6 Tables)

1. **`Department`**: `department_id` (PK), `department_name`, `manager_of_department`
2. **`Category`**: `category_id` (PK), `category_name`
3. **`User`**: `user_id` (PK), `name`, `password`, `phone_number`, `email`, `designation`, `role`, `department_id` (FK)
4. **`ApprovalHierarchy`**: `approval_hierarchy_id` (PK), `department_id` (FK), `level`
5. **`Product`**: `product_id` (PK), `name`, `user_id` (FK), `price_per_product`, `number_of_quantities`, `department_id` (FK), `category_id` (FK), `description`, `status` (`PENDING_FOR_APPROVAL`, `ACTIVE`, `CLOSED`), `created_date`, `updated_date`
6. **`Supplier`**: `supplier_id` (PK), `product_id` (FK), `name`, `phone`, `address`, `email`, `gst_number`, `status`, `rating`, `feedback`

---

## Quick Start

### 1. Prerequisites
Ensure MySQL is running on `localhost:3306`. Database config in `src/main/resources/application.yml`:
- **URL**: `jdbc:mysql://localhost:3306/procurement_db?createDatabaseIfNotExist=true`
- **Username**: `root`
- **Password**: `Root@1234`

### 2. Run Application
```bash
./mvnw spring-boot:run
```

---

## Pre-seeded Test Credentials & Data

Upon startup, `DataInitializer` seeds:
- **Single Admin Account**: `admin@company.com` / `Admin@123`
- **Default Departments**: IT, HR, Testing, Procurement
- **Default Categories**: Electronics, Office Supplies, Peripherals, Furniture
- **Demo Products & Dummy Suppliers**: Active and pending demo records

---

## API Documentation & Swagger UI

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## Postman Collection Import

You can directly import the ready-to-test Postman collection:
1. Open **Postman**.
2. Click **Import** -> Select file [`Enterprise_Procurement_System.postman_collection.json`](file:///home/sujeeth/projects/Infosys-Intern-Project/Enterprise_Procurement_System.postman_collection.json).
3. The collection contains all pre-configured Auth, User, General, and Admin requests with sample payloads and Bearer token variables (`{{userToken}}`, `{{adminToken}}`).

---

## API Endpoints Summary

### Public Routes (`/api/public/*`)
| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| `POST` | `/api/public/register` | Register employee (`USER` role) |
| `POST` | `/api/public/login` | User login (returns JWT token) |
| `POST` | `/api/public/admin/login` | Single Admin login (returns Admin JWT token) |

### Protected User, Supplier & General Routes (`/api/*`)
| Method | Endpoint | Role | Description |
| ------ | -------- | ---- | ----------- |
| `GET` | `/api/departments` | Authenticated | List all departments & managers |
| `GET` | `/api/categories` | Authenticated | List all product categories |
| `GET` | `/api/products` | USER / ADMIN / SUPPLIER | List active inventory catalog products (`products` table) |
| `POST` | `/api/raise-req` | USER | Raise procurement order request (`productId`, `numberOfQuantities`, `description`). Derived automatically from catalog item. |
| `GET` | `/api/suppliers` | Authenticated | List all registered suppliers |
| `GET` | `/api/suppliers/product/{productId}` | Authenticated | List suppliers associated with catalog product ID |
| `POST` | `/api/suppliers/products/{productId}/restock` | SUPPLIER | Supplier refilling inventory stock (`quantityToAdd`, `remarks`) |
| `GET` | `/api/request/{id}/tracking` | Authenticated | View order request audit tracking history |

### Single Admin Routes (`/api/*`)
| Method | Endpoint | Role | Description |
| ------ | -------- | ---- | ----------- |
| `GET` | `/api/users` | ADMIN | List all registered users |
| `GET` | `/api/users/{id}` | ADMIN / Self | Get user profile by ID |
| `GET` | `/api/request/pending` | ADMIN | List procurement requests pending approval (`procurement_requests` table) |
| `GET` | `/api/request/status?requestId={id}` | ADMIN | Get status and details of a procurement request by `requestId` query param |
| `POST` | `/api/request/status` | ADMIN | Approve or reject request taking `requestId` and `status` (`"approve"` or `"reject"`) in request body |
| `DELETE` | `/api/request/{requestId}` | ADMIN | Delete order request record |

---

## Email Notifications

The application automatically sends Gmail SMTP email notifications during key request lifecycle events:

1. **Request Creation (`POST /api/raise-req`)**:
   - **User Email**: Receives a confirmation containing the request ID, product, quantity, total price, and status (`PENDING_FOR_APPROVAL`).
   - **Admin Email(s)**: All system users with `Role.ADMIN` receive a notification about the new request raised by the employee.

2. **Request Approval (`POST /api/request/{id}/status` with `status: "approve"`)**:
   - **User Email**: Receives an approval confirmation informing them that their procurement request has been approved by the Admin (`ACTIVE`).

### Configuration (`application.yml`)
Email functionality is managed by `EmailService` using Spring Boot `JavaMailSender`. Configure your Gmail credentials in `src/main/resources/application.yml`:

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-16-character-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          connectiontimeout: 5000
          timeout: 5000
          writetimeout: 5000
```
> **Note**: For Gmail, generate a 16-character Google **App Password** via [Google Account Security Settings](https://myaccount.google.com/security) (2-Step Verification must be enabled).

