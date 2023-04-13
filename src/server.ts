import * as Discord from "discord.js";
import { ClientOptions } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Discord.Client({ intents: 384 });

client.on("ready", () => {
  console.log("Logged in as ", client.user?.tag ?? "N/A");
});

client.on("voiceStateUpdate", async (vcState) => {
  // console.log("Voice state changed. Here's the current state: ", vcState);

  let turnOn = false;
  if (vcState.id == process.env.BRUNO_ID) {
    if (vcState.channelId === null) {
      if (vcState.sessionId === null) {
        const channels: any[] = (await vcState.guild.channels.fetch())
          .filter((channel) => (channel?.type ?? 0) === 2)
          .map((channel) => channel?.id ?? null)
          .filter((channel) => channel !== null);
        let members: any[] = [];
        for (const channel of channels) {
          const channelMembers = (
            (await vcState.guild.channels.fetch(channel))
              ?.members as unknown as Discord.Collection<
              string,
              Discord.GuildMember
            >
          ).map((member) => member);
          members.push(channelMembers);
        }
        const found = members
          .flat()
          .filter((member) => member !== null)
          .findIndex((member) => member.id == process.env.BRUNO_ID);
        turnOn = found !== -1;
      } else {
        turnOn = true;
      }
    }

    console.log(turnOn ? "on" : "off");
    turnOn
      ? fetch(new URL("http://192.168.1.90/on"), { method: "GET" })
      : fetch(new URL("http://192.168.1.90/off"), { method: "GET" });
  }
});

client.login(process.env.DISCORD_TOKEN);
