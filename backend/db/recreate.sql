-- Recreate the mini_stack_overflow database schema from scratch.
-- This script drops and recreates all application tables.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS question_tags;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS answers;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS profiles;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE profiles (
  id CHAR(36) NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255) DEFAULT NULL,
  reputation INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_username (username),
  UNIQUE KEY uq_profiles_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tags (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL,
  description VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE questions (
  id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id CHAR(36) NOT NULL,
  views INT NOT NULL DEFAULT 0,
  votes INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_questions_author_id (author_id),
  KEY idx_questions_created_at (created_at),
  CONSTRAINT fk_questions_author
    FOREIGN KEY (author_id) REFERENCES profiles(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE answers (
  id CHAR(36) NOT NULL,
  content TEXT NOT NULL,
  question_id CHAR(36) NOT NULL,
  author_id CHAR(36) NOT NULL,
  votes INT NOT NULL DEFAULT 0,
  is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_answers_question_id (question_id),
  KEY idx_answers_author_id (author_id),
  KEY idx_answers_is_accepted (is_accepted),
  CONSTRAINT fk_answers_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_answers_author
    FOREIGN KEY (author_id) REFERENCES profiles(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE question_tags (
  question_id CHAR(36) NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (question_id, tag_id),
  KEY idx_question_tags_tag_id (tag_id),
  CONSTRAINT fk_question_tags_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_question_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE votes (
  id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  votable_id CHAR(36) NOT NULL,
  vote_type TINYINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_votes_user_id (user_id),
  KEY idx_votes_votable_id (votable_id),
  UNIQUE KEY uq_votes_user_votable (user_id, votable_id),
  CONSTRAINT fk_votes_user
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_votes_vote_type
    CHECK (vote_type IN (-1, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Minimal tags seed so the Ask Question page can work immediately.
INSERT INTO tags (name, color, description) VALUES
  ('javascript', '#f7df1e', 'Questions about JavaScript language and ecosystem'),
  ('react', '#61dafb', 'Questions about React and related tooling'),
  ('node.js', '#3c873a', 'Questions about Node.js backend development'),
  ('mysql', '#00758f', 'Questions about MySQL databases and SQL'),
  ('css', '#264de4', 'Questions about CSS styling and layouts');
