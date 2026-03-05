export interface User {
  id: string;
  uid: string;
  username: string;
  display_name: string;
  bio: string;
  profile_pic: string;
  custom_bg: string;
  custom_color: string;
  security_question?: string;
  security_answer?: string;
  created_at: string;
}

export interface Post {
  id: string;
  uid: string;
  username: string;
  display_name: string;
  profile_pic: string;
  image_url: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  uid: string;
  username: string;
  display_name: string;
  profile_pic: string;
  content: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Testimonial {
  id: number;
  user_id: number;
  author_id: number;
  username: string;
  display_name: string;
  profile_pic: string;
  content: string;
  created_at: string;
}

export interface Gift {
  id: number;
  receiver_id: number;
  sender_id: number;
  username: string;
  display_name: string;
  gift_type: string;
  message: string;
  created_at: string;
}
