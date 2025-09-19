// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'index.js',
      exec_mode: 'fork',
      watch: true,
      env_file: '.env'
    },
    {
      name: 'worker',
      script: './services/notificationWorker.js',
      exec_mode: 'fork',
      watch: true,
      env_file: '.env'
    },
    {
      name: 'image-worker',
      script: './services/imageUploadWorker.js',
      exec_mode: 'fork',
      watch: true,
      env_file: '.env'
    }
  ]
};