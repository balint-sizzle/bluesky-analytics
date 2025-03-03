# BlueSky Analytics

A analytics platform under continuous development for BlueSky social network data, featuring a React frontend, Flask backend, and PostgreSQL database—all containerized with Docker.

## Project Overview

BlueSky Analytics provides data visualization and analysis tools for BlueSky social network content. The application allows users to track trends, analyze user engagement, and gain insights from BlueSky posts and interactions.

## Architecture

This project follows a modern microservices architecture:

-   **Frontend**: React application with Tailwind CSS for styling
-   **Backend**: Flask API server providing data endpoints
-   **Database**: PostgreSQL for data storage
-   **Containerization**: Docker and Docker Compose for environment management

<a href="https://ibb.co/mrd20BVP"><img src="https://i.ibb.co/mrd20BVP/Screenshot-2025-03-03-215845.png" alt="Screenshot-2025-03-03-215845" border="0"></a>

## Directory Structure

```
bluesky-analytics/
├── backend/
│   ├── app.py              # Flask application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend Dockerfile
├── frontend/
│   ├── public/             # Static assets
│   ├── src/                # React components and logic
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   ├── postcss.config.js   # PostCSS configuration
│   └── Dockerfile          # Frontend Dockerfile
├── init-db.sql             # PostgreSQL initialization script
├── docker-compose.yml      # Docker Compose configuration
├── .env                    # Environment variables (not in git)
└── README.md               # This file
```

## Getting Started

### Prerequisites

-   Docker and Docker Compose
-   Git

### Installation & Setup

1. Clone the repository:

    ```
    git clone https://github.com/yourusername/bluesky-analytics.git
    cd bluesky-analytics
    ```

2. Create a `.env` file in the backend directory with the following variables:

    ```
    # Database configuration
    DB_USER=postgres
    DB_PASS=your_secure_password
    DB_NAME=bluesky_analytics
    DB_PORT=postgres

    # Flask configuration
    FLASK_ENV=development
    SECRET_KEY=your_secret_key

    # BlueSky API credentials
    BLUESKY_API_KEY=your_bluesky_api_key
    ```

3. Start the application with Docker Compose:

    ```
    docker-compose up --build
    ```

4. Access the application:
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:5000

## Development

### Frontend Development

The frontend is a React application with Tailwind CSS for styling:

```bash
# Enter the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Development

The backend is a Flask application:

```bash
# Enter the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
flask run
```

## API Endpoints

The backend provides the following API endpoints:

-   `GET /api/stats` - Retrieve basic statistics
-   `GET /api/posts` - Get recent posts
-   `GET /api/trends` - Get trending topics
-   `POST /api/analyze` - Submit custom analysis request

## Docker Commands

-   Build and start all containers: `docker-compose up --build`
-   Start services in detached mode: `docker-compose up -d`
-   Stop all services: `docker-compose down`
-   View logs: `docker-compose logs -f`

## Database Management

The PostgreSQL database is initialized with the schema defined in `init-db.sql`. You can connect to the database using:

```bash
docker-compose exec db psql -U postgres -d bluesky_analytics
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
