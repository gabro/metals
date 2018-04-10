package scala.meta.metals.providers

import java.util.zip.ZipEntry
import java.util.zip.ZipOutputStream
import java.io.ByteArrayOutputStream
import scala.meta.AbsolutePath
import com.typesafe.scalalogging.LazyLogging
import io.circe.syntax._
import io.circe.Json
import cats.syntax.either._
import scala.meta.metals.Uri
import scala.meta.metals.Configuration
import scala.meta.metals.compiler.ScalacProvider
import org.langmeta.jsonrpc.Response

class DebugPayloadProvider(
    cwd: AbsolutePath,
    latestConfig: () => Configuration,
    scalacProvider: ScalacProvider
) extends LazyLogging {
  private def zipWithFiles(f: Map[String, Array[Byte]]): Array[Byte] = {
    val out = new ByteArrayOutputStream
    val zip = new ZipOutputStream(out)
    f.foreach {
      case (name, bytes) =>
        zip.putNextEntry(new ZipEntry(name))
        zip.write(bytes)
        zip.closeEntry()
    }
    zip.close()
    out.toByteArray
  }

  private def currentUri(arguments: Option[Seq[Json]]): Option[Uri] =
    arguments.flatMap(_.headOption).flatMap(_.asString).map(Uri.apply)

  def generatePayload(
      arguments: Option[Seq[Json]]
  ): Either[Response.Error, Json] =
    Either.fromOption(
      currentUri(arguments).map { uri =>
        val logFile = cwd.resolve(".metals").resolve("metals.log").readAllBytes
        val config = latestConfig().asJson.spaces2.toCharArray.map(_.toByte)
        val buildInfoEntry = scalacProvider
          .configBySourceDirectory(uri)
          .map { buildInfo =>
            buildInfo.origin
              .toRelative(cwd.resolve(".metals"))
              .toString -> buildInfo.origin.readAllBytes
          }
          .toMap

        zipWithFiles(
          Map(
            "metals.log" -> logFile,
            "configuration.json" -> config,
          ) ++ buildInfoEntry
        ).asJson
      },
      Response.invalidParams(s"Invalid arguments: $arguments")
    )
}
