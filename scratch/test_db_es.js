import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gteviqdzqpwktxiuyoqz.supabase.co';
const supabaseAnonKey = 'sb_publishable_NedO-a6G7bnBd9wwlgUUdA_ngX4qKpY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    console.log("Querying assignments...");
    const { data: assignments, error: assignmentsErr } = await supabase.from('assignments').select('*');
    if (assignmentsErr) throw assignmentsErr;
    console.log("Total assignments:", assignments.length);
    console.log("Sample assignments:", assignments.map(a => ({ id: a.id, title: a.title, course_id: a.course_id })));

    console.log("Querying courses...");
    const { data: courses, error: coursesErr } = await supabase.from('courses').select('*');
    if (coursesErr) throw coursesErr;
    console.log("Total courses:", courses.length);
    console.log("Sample courses:", courses.map(c => ({ id: c.id, code: c.code })));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
