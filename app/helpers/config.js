import { get } from '@ember/object';
import envConfig from 'frontend-verenigingen-loket/config/environment';

export default function config(keyOrPath) {
  return get(envConfig, keyOrPath);
}
