import process from 'node:process';
import { buildSeekerDatabase } from './build-seeker-db.mjs';
import { buildZiSrcDatabase } from './build-zisrc-db.mjs';
import HAN_DATA_CONFIG from './han-data.config.mjs';

async function main() {
  const args = new Map(
    process.argv.slice(2).map(arg => {
      const index = arg.indexOf('=');
      return index >= 0 ? [arg.slice(0, index), arg.slice(index + 1)] : [arg, '1'];
    })
  );
  const unicode = args.get('--unicode') || HAN_DATA_CONFIG.unicode.version;
  const idsCommit = args.get('--commit') || args.get('--ids-commit') || HAN_DATA_CONFIG.ids.commit;
  const tangutCommit =
    args.get('--tangut-commit') || HAN_DATA_CONFIG.tangutIds.commit;
  process.stdout.write(
    `Unified ideographic data build: Unicode ${unicode}, yi-bai/ids ${idsCommit}, ` +
      `TangutIDS ${tangutCommit}\n`
  );
  await buildSeekerDatabase();
  await buildZiSrcDatabase();
  process.stdout.write('Unified ideographic data build completed.\n');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
