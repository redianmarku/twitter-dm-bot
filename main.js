const Twit = require("twit");
const config = require("./config");

// Instantiate Twit client with your Twitter API keys
const T = new Twit(config);

// Set the hashtag and message
const hashtag = "your hashtag";
const message = "write your message here...";

// Function to scrape users, send messages, and repeat
async function scrapeAndSend() {
  try {
    // Scrape tweets with the specified hashtag
    const { data } = await T.get("search/tweets", {
      q: `#${hashtag}`,
      count: 20,
    });

    const users = data.statuses.map((tweet) => ({
      id: tweet.user.id_str,
    }));

    // Send messages to the scraped users with a time delay
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        await T.post("direct_messages/events/new", {
          event: {
            type: "message_create",
            message_create: {
              target: { recipient_id: user.id },
              message_data: { text: message },
            },
          },
        });
        console.log(`Message sent to user with ID ${user.id}`);

        // Delay between sending messages
        const delay = 1 * (60 * 1000); // Delay in milliseconds (e.g., 5000 = 5 seconds)
        await sleep(delay);
      } catch (err) {
        console.error(`Error sending message to user with ID ${user.id}:`);
      }
    }

    // Repeat the process after a delay
    setTimeout(scrapeAndSend, 60000); // Delay in milliseconds (60 seconds = 60000 milliseconds)
  } catch (err) {
    console.error("Error retrieving tweets:", err);
  }
}

// Utility function for delaying execution
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Start the process
scrapeAndSend();
