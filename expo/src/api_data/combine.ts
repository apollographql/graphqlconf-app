import schedule2023 from "./schedule-2023.json" with { type: "json" };
import schedule2024 from "./schedule-2024.json" with { type: "json" };
import schedule2025 from "./schedule-2025.json" with { type: "json" };
import speakersFile from "./speakers.json" with { type: "json" };
import { writeFileSync } from "node:fs";

interface Speaker {
  id: string;
  username: string;
  company: string;
  position: string;
  name: string;
  about: string;
  location: string;
  url: string;
  avatar: string;
  socialurls: {
    service: string;
    url: string;
  }[];
  _years: number[];
}

interface Event {
  id: string;
  name: string;
  year: string;
  start_date: string;
  end_date: string;
  city: string;
}

interface Session {
  id: string;
  event_key: string;
  active: "Y" | "N";
  pinned: "Y" | "N";
  name: string;
  description: string;
  goers: number;
  seats: number;
  audience: string | null;
  invite_only: "Y" | "N";
  type: string;
  subtype: string | null;
  start_time_ts: number;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  year: string;
  event_id: string;
  video_stream: string | null;
  venue_id: string | null;
  speaker_id: string[];
  files: {
    path: string;
    name: string;
  }[];
}

interface Venue {
  id: string;
  name: string;
}

const combined: {
  speakers: Record<string, Speaker>;
  events: Record<string, Event>;
  sessions: Record<string, Session>;
  venues: Record<string, Venue>;
} = {
  speakers: {},
  events: {
    "graphqlconf-2023": {
      id: "graphqlconf-2023",
      name: "GraphQLConf 2023",
      year: "2023",
      start_date: "2023-09-19",
      end_date: "2023-09-21",
      city: "San Francisco",
    },
    "graphqlconf-2024": {
      id: "graphqlconf-2024",
      name: "GraphQLConf 2024",
      year: "2024",
      start_date: "2024-09-10",
      end_date: "2024-09-12",
      city: "San Francisco",
    },
    "graphqlconf-2025": {
      id: "graphqlconf-2025",
      name: "GraphQLConf 2025",
      year: "2025",
      start_date: "2025-09-07",
      end_date: "2025-09-09",
      city: "Amsterdam",
    },
  },
  sessions: {},
  venues: {},
};
const schedules = [schedule2023, schedule2024, schedule2025];

for (const event of schedules.flat()) {
  const {
    id,
    event_key,
    active,
    pinned,
    name,
    description,
    goers,
    seats,
    audience = null,
    invite_only,
    event_type: type,
    // @ts-ignore
    event_subtype: subtype = null,
    start_time_ts,
    start_date,
    start_time,
    end_date,
    end_time,
    event_start_year: year,
    // @ts-ignore
    video_stream = null,
    venue_id = null,
    speakers = [],
    files = [],
  } = event;
  for (const speaker of speakers) {
    const speakerId = speaker.username;
    if (!combined.speakers[speakerId]) {
      const found = speakersFile.speakers.find((s) => s.username === speakerId);
      if (!found) {
        throw new Error(`Speaker ${speakerId} not found for event ${id}`);
      }
      combined.speakers[speakerId] = { ...found, id: speakerId };
    }
  }
  if (venue_id && !combined.venues[venue_id]) {
    if (!event.venue) {
      throw new Error(`Event ${id} has venue_id but no venue name`);
    }
    combined.venues[venue_id] = { id: venue_id, name: event.venue };
  }
  combined.sessions[id] = {
    id,
    event_key,
    active: active as "Y" | "N",
    pinned: pinned as "Y" | "N",
    name,
    description,
    goers: Number(goers),
    seats: Number(seats),
    audience,
    invite_only: invite_only as "Y" | "N",
    type,
    subtype,
    start_time_ts,
    start_date,
    start_time,
    end_date,
    end_time,
    year,
    event_id: `graphqlconf-${year}`,
    video_stream,
    venue_id,
    speaker_id: speakers.map((s) => s.username),
    files,
  };
}

writeFileSync(
  "combined.json",
  JSON.stringify(
    {
      speakers: Object.values(combined.speakers),
      events: Object.values(combined.events),
      sessions: Object.values(combined.sessions),
      venues: Object.values(combined.venues),
    },
    null,
    2
  )
);
