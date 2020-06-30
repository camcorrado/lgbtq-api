BEGIN;

TRUNCATE
    messages,
    conversations,
    profiles,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (full_name, email, password)
VALUES
    ('Korra Avatar', 'legendofkorra@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Ellie Miller', 'lastofus@email.com', '$2a$12$Jur3HrrQY0.CCO2SnU8LqulN7Y3vBh07m4V0QzhGslPBEfzNDMdvy'),
    ('Kung Jin', 'mkx@email.com', '$2a$12$OdhAwdYLgEZI0ObLFHi98ug8IKDseZLioaPTS4UOb7s.H6L6awEZq'),
    ('Flea Chrono', 'chronotrigger@email.com', '$2a$12$O67fsySKta7Cm.jWa2njQubm7N9ijtlgAd7GKYoXNd2XxtMhV5OwK'),
    ('Birdo Birdo', 'yoshi@email.com', '$2a$12$P8FHCExnpFlW84GRBVllbO5b5CEhNlzSIvs6t0gUvpzMGns3ATxWO'),
    ('Quina Quen', 'finalfantasy@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Lena Oxton', 'overwatch@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Haruka Tenoh', 'sailormoon@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Ruby Ruby', 'stevenuniverse@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Queen Marceline', 'adventuretime@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Marland Hoek', 'renandstimpy@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Herb Kazzaz', 'bojack@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Daryl Blubs', 'gravityfalls@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu'),
    ('Jack Morrison', 'overwatch2@email.com', '$2a$12$weAfhl/rteh4oMc8rMQiH.qhrm3sXVU6JJTcBfCdiaqlZnUkVMbfu');


INSERT INTO profiles (user_id, username, bio, profile_pic, interests, pronouns, zipcode, blocked_profiles, favorited_profiles)
VALUES
    (1, 'LoK', 'Master of all four elements!', 'https://upload.wikimedia.org/wikipedia/en/d/db/Korra_The_Legend_of_Korra.jpg', '{"Activism", "Sports"}', 'She/Her', 11111, '{2, 3}', '{4, 5}'),
    (2, 'Zombae', 'I AM THE BRICK MASTER!', 'https://cdn.mos.cms.futurecdn.net/HbYPjx8LutUahfuSdoz5CN-970-80.jpg.webp', '{"Nightlife", "Reading", "Sports"}', 'She/Her', 22222, '{3, 4}', '{5, 6}'),
    (3, 'Bowman', 'Love to learn more about ya.', 'https://rei.animecharactersdatabase.com/uploads/chars/9180-682174789.jpg', '{"Drag", "Nightlife", "Sports"}', 'He/Him', 33333, '{4, 5}', '{6, 7}'),
    (4, 'Forget-Me-Not', 'Male, female, what is the difference?', 'https://vignette.wikia.nocookie.net/villains/images/c/c0/Villain_Flea_drawn_Chrono_Trigger.png/revision/latest/top-crop/width/360/height/450?cb=20130101140357', '{"Art", "Drag", "Fashion", "Music", "Nightlife", "Sports"}', 'He/Him', 4444, '{5, 6}', '{7, 8}'),
    (5, 'Birdetta', 'Just try not to get egg on your face.', 'https://pmcvariety.files.wordpress.com/2018/09/birdo.jpg?w=681&h=383&crop=1', '{"Crafting", "Fashion", "Food", "Gaming", "Sports"}', 'It', 55555, '{6, 7}', '{8, 9}'),
    (6, 'Frogeater', 'Indulgence - I do what I want!', 'http://www.ffwa.eu/ff9/images/char_quina.jpg', '{"Art", "Food"}', 'She/Her/He/Him', 66666, '{7, 8}', '{9, 10}'),
    (7, 'Tracer', 'Cheers, love!', 'https://static2.thegamerimages.com/wordpress/wp-content/uploads/2019/07/Tracer-overwatch-little-known-facts-featured-image.jpg', '{"Activism", "Fashion", "Gaming", "Music", "Sports", "Tech"}', 'She/Her', 77777, '{8, 9}', '{10, 11}'),
    (8, 'Sailor Uranus', 'The Outer Planet of Wind, Guardian of the Heavens.', 'https://66.media.tumblr.com/f4a90d4a617669a463cea42aa7066f45/tumblr_psfq94zwXb1u1ycqw_540.jpg', '{"Activism", "Art", "Drag", "Fashion", "Nightlife", "Reading"}', 'She/Her', 88888, '{9, 10}', '{11, 12}'),
    (9, 'SapphireLuver', 'Iam an eternal flame, baby!', 'https://vignette.wikia.nocookie.net/steven-universe/images/f/fb/Su_ruby_new_3.png/revision/latest?cb=20200511204105', '{"Activism", "Fashion", "Food", "Sports"}', 'She/Her', 99999, '{10, 11}', '{12, 13}'),
    (10, 'BloodyFries', 'Vampires cannot beat ghosts.', 'https://w0.pngwave.com/png/582/210/marceline-the-vampire-queen-ice-king-adventure-frederator-studios-jake-png-clip-art.png', '{"Art", "Food", "Gaming", "Music", "Nightlife", "Reading"}', 'She/Her', 10101, '{11, 12}', '{13, 14}'),
    (11, 'Ren', 'They think I am crazy, but I know better.', 'https://vignette.wikia.nocookie.net/renandstimpy/images/9/9a/Ren-stimpy-25-anniversar-hp1y-1.png/revision/latest/top-crop/width/360/height/450?cb=20170521213617', '{"Crafting", "Food"}', 'He/Him', 11111, '{12, 13}', '{14, 1}'),
    (12, 'HorsinAround', 'Overweight human man with brown hair.', 'https://api.personality-database.com/profile_images/7051.png?credit_id=17990', '{"Art", "Drag", "Food", "Nightlife"}', 'He/Him', 12121, '{13, 14}', '{1, 2}'),
    (13, 'Sheriff Blubs', 'I am gonna take a long slow sip from my cup of coffee.', 'https://vignette.wikia.nocookie.net/disney/images/0/0f/S1e8_blubs_radio.png/revision/latest?cb=20170727061523', '{"Activism", "Food", "Nightlife", "Tech"}', 'He/Him', 13131, '{14, 1}', '{2, 3}'),
    (14, 'Soldier 76', 'Reporting for duty!', 'https://vignette.wikia.nocookie.net/overwatch/images/c/c3/Soldier76_portrait.png/revision/latest/scale-to-width-down/350?cb=20160429041023', '{"Activism", "Tech"}', 'He/Him', 14141, '{1, 2}', '{3, 4}');

INSERT INTO conversations (users) 
VALUES
  ('{1, 4}'),
  ('{1, 12}'),
  ('{3, 6}'),
  ('{5, 8}'),
  ('{7, 10}'),
  ('{9, 13}'),
  ('{11, 14}'),
  ('{13, 2}');

INSERT INTO messages (conversation_id, user_id, content, date_created) 
VALUES
  (1, 1, 'Hi!', '2020-05-05 21:00:00'),
  (1, 4, 'What Up?', '2020-05-06 21:00:00'),

  (2, 1, 'Hey', '2020-05-07 21:00:00'),
  (2, 12, 'How are ya?', '2020-05-08 21:00:00'),
  
  (3, 3, 'Yo!', '2020-05-05 21:00:00'),
  (3, 6, 'How rude...', '2020-05-06 21:00:00'),

  (4, 5, 'Hello!', '2020-05-05 21:00:00'),
  (4, 8, 'Haii', '2020-05-06 21:00:00'),

  (5, 7, 'Hiya', '2020-05-05 21:00:00'),
  (5, 10, 'Howdy', '2020-05-06 21:00:00'),

  (6, 9, 'You!', '2020-05-05 21:00:00'),
  (6, 13, 'Me..?', '2020-05-06 21:00:00'),

  (7, 11, 'Knock Knock', '2020-05-05 21:00:00'),
  (7, 14, 'Just ring the buzzer.', '2020-05-06 21:00:00'),

  (8, 13, 'Bye!', '2020-05-05 21:00:00'),
  (8, 2, 'But we never even said hello!', '2020-05-06 21:00:00');

  

COMMIT;
