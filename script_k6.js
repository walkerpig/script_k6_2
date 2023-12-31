import http from 'k6/http';
import { check, sleep } from 'k6';

const isNumeric = (value) => /^\d+$/.test(value);

const default_vus = 5;
const default_times = 5;

const url_env = `${__ENV.TARGET_URL}`;
const target_vus_env = `${__ENV.TARGET_VUS}`;
const target_time_env = `${__ENV.TARGET_TIME}`;
const target_vus = isNumeric(target_vus_env) ? Number(target_vus_env) : default_vus;
const target_time = isNumeric(target_time_env) ? Number(target_time_env) : default_times;
const target_time_in_minutes = target_time + 'm';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
  },
  stages: [
    // Ramp-up from 1 to TARGET_VUS virtual users (VUs) in 5s
    { duration: target_time_in_minutes, target: target_vus },

    // Stay at rest on TARGET_VUS VUs for 10s
    { duration: target_time_in_minutes, target: target_vus },

    // Ramp-down from TARGET_VUS to 0 VUs for 5s
    { duration: '1m', target: 0 },
  ],
};

export default function () {
  const response = http.get(url_env);
  check(response, { 'status is 200': (r) => r.status === 200 });
  sleep(1);
}
