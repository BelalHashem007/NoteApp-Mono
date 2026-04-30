import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    // define thresholds
    thresholds: {
        http_req_failed: ['rate<0.01'], // http errors should be less than 1%
        http_req_duration: ['p(99)<1000'], // 99% of requests should be below 1s
    },
};

export default function () {
    const url = "http://localhost:5001/api/folders";
    const params = {
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJmNjU2NmI5My1hODE5LTRhZTMtOGVhMS1lNGQyYTBiMTY5NzgiLCJlbWFpbCI6ImFobWVkd2FlbDJAZ21haWwuY29tIiwibmJmIjoxNzc0NzA2MjgwLCJleHAiOjE3NzQ3MDgwODAsImlhdCI6MTc3NDcwNjI4MCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3QiLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdCJ9.cYdRLrD1OaVdLYgL03mj9fO_q4jxpOGXkYO1CzJwl-o',
            'Content-Type':"application/json"
        }
    }

    const res = http.get(url, params);

    check(res, {
        'is status 200': (r) => r.status === 200,
        'is rate limited (429)': (r) => r.status === 429,
    });
}