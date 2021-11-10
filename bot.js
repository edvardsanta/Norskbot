//Requisitions
const env = require("./env/.env");
const {Telegraf, Markup, session, Extra, Scenes} = require("telegraf");
const bot = new Telegraf(env.token);
var a_str;

//Verify userID to use some private parts
const verUser = (ctx, next) =>
{
  const IDmsg = ctx.update.message
        && ctx.update.message.from.id == env.userID;

  const IDcallback = ctx.update.callback_query && ctx.update.callback_query.from.id == env.userID;

  if(IDmsg || IDcallback)
  {
    next()
  }
  else
  {
    ctx.reply("Beklager, jeg får ikke å vise hva jeg kan gjør i denne økten foreløpig. Bare masteren min kan håndter her ")
  }
}

//Create a list of words
const ordScene = new Scenes.BaseScene('ord');
ordScene.enter(async ctx =>
{
   await ctx.reply("Write the words or sentences");
   ctx.session.list = Array(); 
});
var tempo = 0;
ordScene.on("text",  async ctx =>
{
  let word = ctx.session.list;
  let msg = ctx.update.message.text
  word.push(msg);
  a_str = word.join("\n");
  await ctx.replyWithHTML(`
Ord list 
${a_str}`, Markup.inlineKeyboard([       Markup.button.callback('Stop', "stop")]));
  console.log(a_str);
});
ordScene.action("stop", ctx =>
{
  ctx.reply("When do you want to be remembered?",
  Markup.inlineKeyboard([
 Markup.button.callback('30 min', "tretti"),
 Markup.button.callback("1 time", "en t"), 
 Markup.button.callback("3 timer", "tre"),
 Markup.button.callback("En dag", "en d"),
  ]));
})

//30 minutes
ordScene.action("tretti", async ctx =>
{
  await setTimeout(() =>
  { 
   ctx.reply(`Here is your list 
${a_str}`);}, 1800000);
  await ctx.reply("Du valgte 30 minutter. Vær så snill, ikke klikk på en annen knapp");
});
//1 hour
ordScene.action("en t", async ctx =>
{
  await setTimeout(() =>                  {                                         ctx.reply(`Here is your list
${a_str}`);}, 3600000);             
});
//3 hours
ordScene.action("tre", verUser, async ctx =>
{
  await setTimeout(() =>                  {                                         ctx.reply(`Here is your list
${a_str}`);}, 10800000);                 });
//1 day
ordScene.action("en d", verUser, async ctx =>
{
  await setTimeout(() =>                  {                                        ctx.reply(`Here is your list 
${a_str}`);}, 86400000);                 });

ordScene.leave(async (ctx) => {
  await ctx.reply('Thank you for your time!');
});


//Show the meaning of the words
const meanScene = new Scenes.BaseScene("mean");
meanScene.enter(async  ctx =>
{ await ctx.reply("Foreløpig kan jeg bare send links for deg") })
meanScene.on("text", async ctx =>
{ 
  let msg = ctx.update.message.text;
  await ctx.replyWithHTML(`<a href="https://en.bab.la/dictionary/norwegian-english/${msg}">bab.la</a>
<a href="https://ordbok.uib.no/perl/ordbok.cgi?OPP=${msg}&ant_bokmaal=5&ant_nynorsk=5&begge=+&ordbok=begge">Ordbok</a>`)
  return ctx.scene.leave();
})
meanScene.leave(async ctx =>
{
  await ctx.reply("Takk for din tid");
  return await await ctx.reply('I can do it for while', Markup.inlineKeyboard([                   Markup.button.callback('Ord', "ord"),     Markup.button.callback('Meaning', "mean"),]));
})

bot.start(ctx =>
{
  console.log(ctx.from);
  ctx.reply(`Hi, jeg er en norsk bot, si Hallo`);
 ctx.reply("Please check observations if you are a new user");
  return ctx.reply('You can write manually', Markup
    .keyboard([
      ["Hallo" , 'Announcements'], 
      ['News', "Help", "Observations"] 
    ])
    .oneTime()
    .resize()
  );
})


//Help
bot.help(ctx => {
  ctx.replyWithHTML(`This <b> bot </b> is being made to help norwegian learners.
Please, if you have any suggestions, anycomnplaint, tell me on our group.
Join on our <a href='https://t.me/norsk_1'> group </a>`);
});
bot.hears(/[Hh]elp/, ctx =>
{
  ctx.replyWithHTML(`This <b> bot </b> is being made to help norwegian learners.                                       
Please, if you have any suggestions, any
comnplaint, tell me on our group.     	
Join on our <a href='https://t.me/norsk_1'> group </a>`);
})

//bot initialization
bot.hears(/[Hh]allo/, async ctx =>
{
  await ctx.reply(`Hallo ${ctx.from.first_name}, jeg er i testfasen`);
  await ctx.reply('I can do it for while', Markup.inlineKeyboard([                      Markup.button.callback('Ord', "ord"),    
   Markup.button.callback('Meaning', "mean"),]));
});
bot.command("hallo", async ctx =>
{
  await ctx.reply('I can do it for while', Markup.inlineKeyboard([
	Markup.button.callback('Ord', "ord"),                                      Markup.button.callback('Meaning', "mean"),]));
});

//Versions 
bot.hears(/[Nn]ews/, async ctx =>
{
  ctx.replyWithHTML(`• Now you can create a word list
• Added ordbok on meaning session`);
});

//Anouncements 
bot.hears(/[Aa]nnouncements/, async ctx => 
{
  ctx.replyWithHTML("Nothing to anounce, when I'm in Maintenance look at my description");
});

//Observations to use 
bot.hears(/[Oo]bservations/, async ctx =>
{
  ctx.replyWithHTML(`If your question is not in this session, please write /help and contact with us.

Please <b>pay attention</b>
Tags words that <b>CANNOT</b> be used (on list or meaning)
• Start 
• News
• Hallo
• Observations
• Help
• Anouncements
I <strong> do not </strong> save any of your information. Whem you create a wordlist, that is just saved in your personal session, therefore, the list is automatically deleted after a creation of a new or if my reinitialization happens.`);
});
bot.hears("Massacraram o meu garoto", verUser, async ctx =>
{ await ctx.reply("Ola mestre")});

const stage = new Scenes.Stage([ordScene, meanScene]);
bot.use(session()); 
bot.use(stage.middleware());
bot.action("ord", ctx => {ctx.scene.enter("ord")});
bot.action("mean", ctx => {ctx.scene.enter("mean")});
bot.launch();
