--
-- PostgreSQL database dump
--



-- Dumped from database version 18.3 (Debian 18.3-1.pgdg12+1)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: smart_study_u0sl_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO smart_study_u0sl_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO smart_study_u0sl_user;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.channels (
    channel_id integer NOT NULL,
    workspace_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(500),
    color character varying(7) DEFAULT '#3B82F6'::character varying NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.channels OWNER TO smart_study_u0sl_user;

--
-- Name: channels_channel_id_seq; Type: SEQUENCE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE SEQUENCE public.channels_channel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.channels_channel_id_seq OWNER TO smart_study_u0sl_user;

--
-- Name: channels_channel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: smart_study_u0sl_user
--

ALTER SEQUENCE public.channels_channel_id_seq OWNED BY public.channels.channel_id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.messages (
    message_id integer NOT NULL,
    workspace_id integer NOT NULL,
    sender_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    channel_id integer NOT NULL
);


ALTER TABLE public.messages OWNER TO smart_study_u0sl_user;

--
-- Name: messages_message_id_seq; Type: SEQUENCE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE SEQUENCE public.messages_message_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_message_id_seq OWNER TO smart_study_u0sl_user;

--
-- Name: messages_message_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: smart_study_u0sl_user
--

ALTER SEQUENCE public.messages_message_id_seq OWNED BY public.messages.message_id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.tasks (
    task_id integer NOT NULL,
    workspace_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(255) NOT NULL,
    assigned_to integer NOT NULL,
    due_date timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tasks OWNER TO smart_study_u0sl_user;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE SEQUENCE public.tasks_task_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_task_id_seq OWNER TO smart_study_u0sl_user;

--
-- Name: tasks_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: smart_study_u0sl_user
--

ALTER SEQUENCE public.tasks_task_id_seq OWNED BY public.tasks.task_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    hashed_pwd character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO smart_study_u0sl_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO smart_study_u0sl_user;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: smart_study_u0sl_user
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: workspace_members; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.workspace_members (
    workspace_member_id integer NOT NULL,
    workspace_id integer NOT NULL,
    user_id integer NOT NULL,
    role character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workspace_members OWNER TO smart_study_u0sl_user;

--
-- Name: workspace_members_workspace_member_id_seq; Type: SEQUENCE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE SEQUENCE public.workspace_members_workspace_member_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspace_members_workspace_member_id_seq OWNER TO smart_study_u0sl_user;

--
-- Name: workspace_members_workspace_member_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: smart_study_u0sl_user
--

ALTER SEQUENCE public.workspace_members_workspace_member_id_seq OWNED BY public.workspace_members.workspace_member_id;


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE TABLE public.workspaces (
    workspace_id integer NOT NULL,
    owner_id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workspaces OWNER TO smart_study_u0sl_user;

--
-- Name: workspaces_workspace_id_seq; Type: SEQUENCE; Schema: public; Owner: smart_study_u0sl_user
--

CREATE SEQUENCE public.workspaces_workspace_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workspaces_workspace_id_seq OWNER TO smart_study_u0sl_user;

--
-- Name: workspaces_workspace_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: smart_study_u0sl_user
--

ALTER SEQUENCE public.workspaces_workspace_id_seq OWNED BY public.workspaces.workspace_id;


--
-- Name: channels channel_id; Type: DEFAULT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.channels ALTER COLUMN channel_id SET DEFAULT nextval('public.channels_channel_id_seq'::regclass);


--
-- Name: messages message_id; Type: DEFAULT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.messages ALTER COLUMN message_id SET DEFAULT nextval('public.messages_message_id_seq'::regclass);


--
-- Name: tasks task_id; Type: DEFAULT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.tasks ALTER COLUMN task_id SET DEFAULT nextval('public.tasks_task_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Name: workspace_members workspace_member_id; Type: DEFAULT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspace_members ALTER COLUMN workspace_member_id SET DEFAULT nextval('public.workspace_members_workspace_member_id_seq'::regclass);


--
-- Name: workspaces workspace_id; Type: DEFAULT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspaces ALTER COLUMN workspace_id SET DEFAULT nextval('public.workspaces_workspace_id_seq'::regclass);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (channel_id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (message_id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (task_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: workspace_members workspace_members_pkey; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_pkey PRIMARY KEY (workspace_member_id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (workspace_id);


--
-- Name: ix_channels_channel_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_channels_channel_id ON public.channels USING btree (channel_id);


--
-- Name: ix_channels_workspace_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_channels_workspace_id ON public.channels USING btree (workspace_id);


--
-- Name: ix_messages_channel_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_messages_channel_id ON public.messages USING btree (channel_id);


--
-- Name: ix_messages_message_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_messages_message_id ON public.messages USING btree (message_id);


--
-- Name: ix_tasks_task_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_tasks_task_id ON public.tasks USING btree (task_id);


--
-- Name: ix_users_user_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_users_user_id ON public.users USING btree (user_id);


--
-- Name: ix_workspace_members_workspace_member_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_workspace_members_workspace_member_id ON public.workspace_members USING btree (workspace_member_id);


--
-- Name: ix_workspaces_workspace_id; Type: INDEX; Schema: public; Owner: smart_study_u0sl_user
--

CREATE INDEX ix_workspaces_workspace_id ON public.workspaces USING btree (workspace_id);


--
-- Name: channels channels_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(user_id);


--
-- Name: channels channels_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(workspace_id);


--
-- Name: messages fk_messages_channel_id; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fk_messages_channel_id FOREIGN KEY (channel_id) REFERENCES public.channels(channel_id);


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(user_id);


--
-- Name: messages messages_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(workspace_id);


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(user_id);


--
-- Name: tasks tasks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(workspace_id);


--
-- Name: workspace_members workspace_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: workspace_members workspace_members_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspace_members
    ADD CONSTRAINT workspace_members_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(workspace_id);


--
-- Name: workspaces workspaces_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: smart_study_u0sl_user
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(user_id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO smart_study_u0sl_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO smart_study_u0sl_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO smart_study_u0sl_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO smart_study_u0sl_user;


--
-- PostgreSQL database dump complete
--

