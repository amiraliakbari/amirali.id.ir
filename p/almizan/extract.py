#!/usr/bin/env python3
import json
import os


def extract_chapters():
    data_dir = os.path.join(os.getcwd(), 'data')
    if not os.path.exists(data_dir):
        print('[ERROR] Data directory not found in current directory.')
        return 1
    dist_dir = os.path.join(os.getcwd(), 'dist')
    if not os.path.exists(dist_dir):
        os.mkdir(dist_dir)

    def save_section(sec):
        if not sec:
            return
        print('==> exported section: ' + sec['id'])
        fd = open(os.path.join(dist_dir, sec['id'] + '.json'), 'w', encoding='utf8')
        json.dump(sec, fd, ensure_ascii=False)

    prev_section = None

    ls = os.listdir(data_dir)
    for filename in sorted(ls):
        full_filename = os.path.join(data_dir, filename)
        if not os.path.isfile(full_filename):
            continue

        try:
            si = filename.index(' ')
            chapter_index = int(filename[:si])
            chapter_name = filename[si + 1:]
        except ValueError:
            print('[SKIPPED] Invalid filename format: {}'.format(filename))
            continue

        section = None
        section_id = 1
        verse_id = 1
        lo = 0
        for l in open(full_filename):
            lo += 1
            l = l.strip()
            while l.startswith('###'):  # converting all lower levels to subsection
                l = l[1:]

            if not l:
                continue
            elif l.startswith('# '):
                save_section(section)
                section = {
                    'id': '{}-{}'.format(chapter_index, section_id),
                    'chapter': chapter_name,
                    'section': l[2:],
                    'verses': [],
                    'translations': [],
                    'versesOffset': verse_id,
                    'subsections': []
                }
                if section_id == 1 and prev_section:
                    section['prevSection'] = prev_section
                section_id += 1
            elif l.startswith('## '):
                if not section:
                    print('[SKIPPED] unexpected subsection @{}'.format(lo))
                    continue
                section['subsections'].append({
                    'title': l[3:],
                    'text': '',
                })
            elif l.startswith('::آیات::'):
                if not section:
                    print('[SKIPPED] unexpected directive @{}'.format(lo))
                    continue
                section['verses'] = l[8:].strip().split('/')
                verse_id += len(section['verses'])
            elif l.startswith('::ترجمه::'):
                if not section:
                    print('[SKIPPED] unexpected directive @{}'.format(lo))
                    continue
                section['translations'] = l[9:].strip().split('/')
            elif l == '::بدون شماره آیات::':
                if not section:
                    print('[SKIPPED] unexpected directive @{}'.format(lo))
                    continue
                section['versesOffset'] = None
            elif l == '::لغو::':
                break
            else:
                if not section or not len(section['subsections']):
                    print('[SKIPPED] bad text line @{}'.format(lo))
                    continue
                section['subsections'][-1]['text'] += '<p>{}</p>'.format(l)

        if section:
            section['eos'] = True
            prev_section = section_id - 1
            save_section(section)


if __name__ == '__main__':
    extract_chapters()
