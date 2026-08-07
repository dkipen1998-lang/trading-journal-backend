import fetch from 'node-fetch';

(async () => {
  try {
    const res = await fetch('https://finance.yahoo.com/topic/latest-news/');
    const text = await res.text();
    console.log(text.slice(0, 2400));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
