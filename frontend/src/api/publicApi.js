import axios from 'axios';
import { API_BASE_URL } from '../config';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

export default publicApi;