import http from 'k6/http';
import { check, sleep } from 'k6';

const isNumeric = (value) => /^\d+$/.test(value);

const default_requests = 100;
const default_times = 5;

const url_env = `${__ENV.TARGET_URL}`;
const target_requests_env = `${__ENV.TARGET_REQUESTS}`;
const target_time_env = `${__ENV.TARGET_TIME}`;
const target_requests = isNumeric(target_requests_env) ? Number(target_requests_env) : default_requests;
const target_time = isNumeric(target_time_env) ? Number(target_time_env) : default_times;
const target_time_in_minutes = target_time + 'm';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    // Ramp-up from 1 to target_requests requests per second in 5s
    { duration: target_time_in_minutes, target: target_requests / target_time },

    // Stay at rest on target_requests requests per second for 10s
    { duration: target_time_in_minutes, target: target_requests / target_time },

    // Ramp-down from target_requests requests per second to 0 for 5s
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const response = http.get(url_env);
  check(response, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
