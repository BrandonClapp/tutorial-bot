### What is this?

This is a repository created through this tutorial playlist: https://www.youtube.com/watch?v=sF-M7XRw7bc&list=PLsClh15QqVh6StruLDIlyl_aEXA3frmml

### What is required to follow along?

- Basic programming knowledge, either in JavaScript or other language.
- Git installed
- Node.js installed
- A Discord account

### How do I use this?

In order to "checkout" the source code for a given video, you will need git installed.

1. You first need to clone this repository. You may use your favorite git GUI tool or terminal that has access to the `git` command (git bash is preferred on Windows).

Cloning may look something like this...

```
cd C:\Users\<your_user>\Documents
git clone https://github.com/BrandonClapp/tutorial-bot
```

2. Change to the `tutorial-bot` directory and checkout the branch you desire.

```
cd tutorial-bot
git checkout ep4
```

3. Install the npm dependenceies (having Node.js installed is a requirement)

```
npm install
```

4. Create a `.env` file that looks similar to this, substituting in your discord bot's token. If you're not sure how to get a token, we cover this in episode 1.

```
TOKEN=EnterYourDiscordBotTokenHere
```

The start of each video will coorespond to a branch on this repository. For example, in episode 4, you can you should be able to `git checkout ep4` to get the source code to follow along in the video.
