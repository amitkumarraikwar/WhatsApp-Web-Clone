# WhatsApp Web Clone - MERN Stack

A full-stack WhatsApp Web clone built using the MERN (MongoDB, Express, React, Node.js) stack with real-time chat functionality powered by Socket.IO.

## Features

- User authentication (JWT-based)
- Real-time messaging with Socket.IO
- Typing indicators
- User search and chat creation
- Responsive design
- Protected routes for authenticated users
- MongoDB for data persistence

## Prerequisites

Ensure you have the following installed:

- Node.js (>=16.x)
- MongoDB (>=4.x)
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/amitkumarraikwar/whatsapp-web-clone.git
cd whatsapp-web-clone
```

### 2. Install Dependencies

#### For the Client

```bash
cd client
npm install
```

#### For the Server

```bash
cd server
npm install
```

### 3. Configure Environment Variables

#### Server

Create a `.env` file in the `server` directory and configure the following:

```properties
PORT=5000
MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4. Start the Application

#### Start the Server

```bash
cd server
npm run dev
```

#### Start the Client

```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173`.

## Project Structure

```
whatsapp-web-clone
├── client
│   ├── src
│   │   ├── components       # Reusable React components
│   │   ├── contexts         # React context for state management
│   │   ├── pages            # Application pages
│   │   ├── services         # API service functions
│   │   ├── types            # TypeScript type definitions
│   │   ├── index.css        # Global styles
│   │   ├── main.tsx         # Application entry point
│   │   └── vite-env.d.ts    # Vite environment types
│   ├── package.json         # Client dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── tsconfig.json        # TypeScript configuration
│   └── README.md            # Project documentation
├── server
│   ├── src
│   │   ├── config           # Database configuration
│   │   ├── controllers      # Route controllers
│   │   ├── middleware       # Express middleware
│   │   ├── models           # Mongoose models
│   │   ├── routes           # Express routes
│   │   └── index.js         # Server entry point
│   ├── .env                 # Environment variables
│   ├── package.json         # Server dependencies
│   └── package-lock.json
└── README.md                # Project documentation
```

## Scripts

### Client

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run preview`: Preview the production build

### Server

- `npm run dev`: Start the server in development mode
- `npm run start`: Start the server in production mode

## Technologies Used

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT for authentication

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
