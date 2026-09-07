# Asking for permission to use a photograph

Copy this, fill in the four bracketed parts, and send it to the office that
owns the image. For a Methodist Church Ghana image that is the Methodist
Media Production office, reachable through the Connexional Communications
Directorate or through the diocese the photograph was taken in.

Most church media offices say yes to this. They are usually pleased that
the picture is wanted, and a credit line is worth something to them. What
they object to is finding the photograph already in use.

---

**Subject:** Permission to use a photograph, with credit

Good morning,

My name is [YOUR NAME] and I run Manuel Technologies, a Ghanaian software
company. We have built Fold, a church management system for Ghanaian
churches, at getfold.org.

I would like to ask permission to use one of your photographs on our
website. It is [DESCRIBE THE PHOTOGRAPH, for example: the picture of the
Bishop with the congregation at (event), published on (date/where)].

Specifically I am asking for:

- Permission to publish it on getfold.org, a commercial website
- Permission to use it at a reduced size and cropped to fit the page layout

In return we would:

- Credit it as "Photograph: Methodist Media Production" beside the image
- Link the credit to any page you would like it to point at
- Remove it immediately on request, no reason needed
- Not imply that the Methodist Church Ghana endorses or uses our software

I understand there are people identifiable in the photograph. If consent
for commercial use was not obtained from them, please tell me and I will
not use it. I would rather ask twice than put someone's face on an
advertisement they did not agree to.

If it is easier, I would also be glad to commission a photographer, or to
be pointed at images you already license for outside use.

Thank you for considering it.

[YOUR NAME]
[PHONE]
[EMAIL]
Manuel Technologies, getfold.org

---

## If they say yes

1. Get it in writing, an email is enough, and keep it.
2. Save the file into `/public`, for example `/public/congregation.jpg`.
3. Set the environment variables in Vercel:

   - `NEXT_PUBLIC_CONGREGATION_IMAGE=/congregation.jpg`
   - `NEXT_PUBLIC_CONGREGATION_CAPTION=` the church or occasion
   - `NEXT_PUBLIC_CONGREGATION_CREDIT=Methodist Media Production`
   - `NEXT_PUBLIC_CONGREGATION_ALT=` a plain description for screen readers

4. Redeploy. The band appears on the homepage. Nothing else to change.

## The better option, if you can manage it

A photograph taken at your own demo church, with a signed release from the
church and from anyone clearly recognisable. It costs a phone call, it
belongs to you outright, and you can caption it with the church's name,
which turns a decoration into the social proof the homepage is missing.

Ask for a landscape frame with deliberate empty space on one side, shot
from the back or the side of the congregation so faces are less
individually identifiable.
