--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: get_all_users_with_levels(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.get_all_users_with_levels() RETURNS TABLE(user_id integer, username character varying, level_name character varying, description text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY (
        SELECT u.id, u.username, ul.level_name, ul.description
        FROM users u
        LEFT JOIN user_levels ul ON u.level = ul.id
    );
END;
$$;


ALTER FUNCTION public.get_all_users_with_levels() OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: genres; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.genres OWNER TO admin;

--
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.genres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_id_seq OWNER TO admin;

--
-- Name: genres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.genres_id_seq OWNED BY public.genres.id;


--
-- Name: movie_genres; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.movie_genres (
    movie_id integer NOT NULL,
    genre_id integer NOT NULL
);


ALTER TABLE public.movie_genres OWNER TO admin;

--
-- Name: movies; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    image character varying(255),
    trailerid character varying(255),
    userid integer,
    "position" integer DEFAULT 0 NOT NULL,
    release_year integer NOT NULL
);


ALTER TABLE public.movies OWNER TO admin;

--
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO admin;

--
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- Name: ratings; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.ratings (
    id integer NOT NULL,
    movie_id integer,
    rating numeric(3,1) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT ratings_rating_check CHECK (((rating >= (0)::numeric) AND (rating <= (10)::numeric)))
);


ALTER TABLE public.ratings OWNER TO admin;

--
-- Name: ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ratings_id_seq OWNER TO admin;

--
-- Name: ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.ratings_id_seq OWNED BY public.ratings.id;


--
-- Name: user_levels; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.user_levels (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.user_levels OWNER TO admin;

--
-- Name: user_levels_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.user_levels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_levels_id_seq OWNER TO admin;

--
-- Name: user_levels_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.user_levels_id_seq OWNED BY public.user_levels.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying NOT NULL,
    last_login timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    nickname character varying(255),
    password character varying(255),
    email character varying(255),
    birthdate date,
    credits numeric(10,2) DEFAULT 500,
    tickets integer DEFAULT 0,
    subscriptions integer DEFAULT 0,
    level integer
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: genres id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.genres ALTER COLUMN id SET DEFAULT nextval('public.genres_id_seq'::regclass);


--
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- Name: ratings id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.ratings ALTER COLUMN id SET DEFAULT nextval('public.ratings_id_seq'::regclass);


--
-- Name: user_levels id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_levels ALTER COLUMN id SET DEFAULT nextval('public.user_levels_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.genres (id, name) FROM stdin;
1	Драма
2	Комедия
3	Фантастика
4	Боевик
5	Триллер
6	Мелодрама
7	Приключения
8	Ужасы
9	Документальный
10	Анимация
11	Музыкальный
12	Исторический
13	Фэнтези
14	Семейный
15	Спорт
16	Криминал
17	Романтика
18	Научная фантастика
19	Супергеройский
20	Психологический триллер
21	Военный
\.


--
-- Data for Name: movie_genres; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.movie_genres (movie_id, genre_id) FROM stdin;
1	1
1	4
2	3
2	2
3	4
3	1
4	1
6	3
6	1
7	2
7	3
8	1
8	5
5	2
5	3
9	1
9	7
9	18
\.


--
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.movies (id, title, description, image, trailerid, userid, "position", release_year) FROM stdin;
1	Миссия невыполнима: Последствия	Итэн Хант и его команда должны остановить глобальную катастрофу, сталкиваясь с новыми угрозами и предательством. Фильм полон захватывающих трюков и напряженных моментов.	images/mission_impossible.jpg	83d42c83caf51bba2da96b8f69ff866c/	\N	0	2018
2	Человек-паук: Через вселенные	Майлз Моралес объединяется с другими Человеками-пауками из разных вселенных, чтобы спасти мультивселенную от угрозы. Фильм получил признание за свою оригинальность и визуальный стиль.	images/spiderman.jpg	53c7e32f5262e18dd4c45e7e7636bce0/	\N	0	2018
3	Топ Ган: Маверик	Пилот-ас Пит "Маверик" Митчелл возвращается в школу Top Gun, чтобы обучить новое поколение летчиков. Он сталкивается с вызовами прошлого и обязанностью защитить своих учеников.	images/top_gun.jpg	564614751c0778e4ed299e1d4bc5712f/	1	0	2022
4	Джек Ричер	Бывший военный полицейский Джек Ричер оказывается втянутым в опасную игру, когда его обвиняют в убийстве. Он должен использовать свои навыки, чтобы найти настоящего преступника и раскрыть заговор.	images/JackReacher.jpeg	f8768323d283ffdd0cf4d7f491852c7e	1	0	2012
5	test	test1		test	\N	0	2010
6	Чудо-женщина 1984	Вторая часть приключений Чудо-женщины, где она сталкивается с новыми врагами и использует свои силы, чтобы спасти мир от угрозы, исходящей от загадочного Макса Лорда и Кристаллы, способной исполнять желания.	images/wonder_woman.jpg	d0b4f94741bea8f1b5edfca77cd9174e/	1	0	2020
7	Барби	Кукла Барби отправляется в захватывающее приключение, чтобы найти свое истинное предназначение. Фильм сочетает элементы комедии и приключения, исследуя темы самопринятия и дружбы.	images/barbie.jpg	0ee355c0efe1a65f7801630d7044ecc6/	\N	2	2023
8	Опенгеймер	Драма о Роберте Оппенгеймере, отце атомной бомбы. Фильм исследует его жизнь, моральные дилеммы и последствия создания атомного оружия.	images/oppenheimer.jpg	338a1eb8ed72e5d876031b4689593996/	\N	3	2023
9	Дюна	Эпическая адаптация знаменитого романа Фрэнка Герберта о борьбе за контроль над планетой Арракис, единственным источником самого ценного ресурса во вселенной — спайса. Молодой Пол Атрейдес должен выполнить свое предназначение и сплотить различные народы.	images/dune.jpg	09868bb8024184b672174c9e637f484f/	1	0	2021
\.


--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.ratings (id, movie_id, rating, created_at) FROM stdin;
1	1	7.8	2025-05-01 04:58:17.910099
2	1	8.0	2025-05-01 04:58:17.910099
3	1	7.9	2025-05-01 04:58:17.910099
4	2	8.4	2025-05-01 04:58:17.910099
5	2	8.5	2025-05-01 04:58:17.910099
6	2	8.7	2025-05-01 04:58:17.910099
7	3	8.3	2025-05-01 04:58:17.910099
8	3	8.5	2025-05-01 04:58:17.910099
9	3	8.6	2025-05-01 04:58:17.910099
10	4	7.0	2025-05-01 04:58:17.910099
11	4	7.5	2025-05-01 04:58:17.910099
12	4	6.8	2025-05-01 04:58:17.910099
13	5	6.0	2025-05-01 04:58:17.910099
14	5	6.3	2025-05-01 04:58:17.910099
15	5	6.5	2025-05-01 04:58:17.910099
16	6	7.5	2025-05-01 04:58:17.910099
17	6	6.8	2025-05-01 04:58:17.910099
18	6	7.0	2025-05-01 04:58:17.910099
19	7	7.9	2025-05-01 04:58:17.910099
20	7	8.0	2025-05-01 04:58:17.910099
21	7	8.2	2025-05-01 04:58:17.910099
22	8	8.4	2025-05-01 04:58:17.910099
23	8	8.5	2025-05-01 04:58:17.910099
24	8	8.3	2025-05-01 04:58:17.910099
25	9	8.2	2025-05-01 04:58:17.910099
26	9	8.1	2025-05-01 04:58:17.910099
27	9	8.4	2025-05-01 04:58:17.910099
\.


--
-- Data for Name: user_levels; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.user_levels (id, name, description) FROM stdin;
1	VIP	Для самых преданных зрителей! 🌟
2	Киномагнат	Для тех, кто инвестирует в свои увлечения! 💰
3	Кинознаток	За активное участие и множество покупок! 🎟️
4	Киноэнтузиаст	Для тех, кто любит посещать показы и концерты! 🎉
5	Кинолюбитель	За первую покупку билета или подписки! 🍿
0	Наблюдатель	Для тех, кто готов начать своё киноприключение! 🎬
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, username, role, last_login, is_active, nickname, password, email, birthdate, credits, tickets, subscriptions, level) FROM stdin;
17	test	user	\N	t	test	$2b$10$o4paoF2aEUxUseKEpz3Ia.h7FwrZjYi3hqfagqDSEaDyJu7xH9XzW	\N	\N	911.87	0	0	5
23	test3	user	\N	t	t	$2b$10$x4TuIyfhyxuIXTSsQ8YWiOalA63e/.6D6qK8ugEZP4Btc09Ms9xKS	t@mail.ru	\N	500.00	0	0	0
1	atnarziev	admin	\N	t	guest1001	$2b$10$t3ry6I9nKqBjpw8BtE7iSew2kZygIiSxt2U16FNSI3Gi8fGuEW.pq	anatolypozd739@gmail.com	2025-04-18	911887.78	0	0	1
24	test2	user	\N	t	\N	$2b$10$MqYbxNRehseewsju8/7sFu2SpnFQ0OMn7xIt.rV7vBzq5/23oz/kW	\N	\N	500.00	0	0	0
\.


--
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.genres_id_seq', 21, true);


--
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.movies_id_seq', 20, true);


--
-- Name: ratings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.ratings_id_seq', 27, true);


--
-- Name: user_levels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.user_levels_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.users_id_seq', 27, true);


--
-- Name: genres genres_name_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_name_key UNIQUE (name);


--
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- Name: movie_genres movie_genres_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_pkey PRIMARY KEY (movie_id, genre_id);


--
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- Name: ratings ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_pkey PRIMARY KEY (id);


--
-- Name: user_levels user_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.user_levels
    ADD CONSTRAINT user_levels_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_movie_genres; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_movie_genres ON public.movie_genres USING btree (genre_id);


--
-- Name: idx_movies_title; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_movies_title ON public.movies USING btree (title text_pattern_ops);


--
-- Name: idx_movies_year; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_movies_year ON public.movies USING btree (release_year);


--
-- Name: idx_ratings_movie; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_ratings_movie ON public.ratings USING btree (movie_id);


--
-- Name: movies_position_unique; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX movies_position_unique ON public.movies USING btree ("position") WHERE ("position" > 0);


--
-- Name: movie_genres movie_genres_genre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_genre_id_fkey FOREIGN KEY (genre_id) REFERENCES public.genres(id) ON DELETE CASCADE;


--
-- Name: movie_genres movie_genres_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movie_genres
    ADD CONSTRAINT movie_genres_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- Name: movies movies_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ratings ratings_movie_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.ratings
    ADD CONSTRAINT ratings_movie_id_fkey FOREIGN KEY (movie_id) REFERENCES public.movies(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

